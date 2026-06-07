import ipaddress
import json
import os
import re
import socket
import time
from collections import defaultdict, deque
from pathlib import Path
from typing import Any, Dict, List, Optional
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


VARIABLE_RE = re.compile(r"\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}\}")
MAX_RESPONSE_BYTES = 1_000_000
HF_DEFAULT_API_BASE = "https://router.huggingface.co/v1/chat/completions"
HF_DEFAULT_MODEL_ID = "openai/gpt-oss-20b"


def load_env_file(path: Path, override: bool = True) -> None:
    if not path.exists():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if override or key not in os.environ:
            os.environ[key] = value


load_env_file(Path(__file__).resolve().parent / ".env")


class Node(BaseModel):
    id: str
    type: str
    data: Dict[str, Any] = Field(default_factory=dict)


class Edge(BaseModel):
    id: Optional[str] = None
    type: Optional[str] = None
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None


class Pipeline(BaseModel):
    nodes: List[Node]
    edges: List[Edge]


def env_float(name: str, default: float) -> float:
    try:
        return float(os.getenv(name, default))
    except (TypeError, ValueError):
        return default


def edge_get(edge: Any, key: str) -> Any:
    if isinstance(edge, BaseModel):
        return getattr(edge, key, None)
    return edge.get(key)


def node_get(node: Any, key: str) -> Any:
    if isinstance(node, BaseModel):
        return getattr(node, key, None)
    return node.get(key)


def port_name(node_id: str, handle_id: Optional[str], fallback: str) -> str:
    if not handle_id:
        return fallback
    prefix = f"{node_id}-"
    return handle_id[len(prefix):] if handle_id.startswith(prefix) else handle_id


def check_is_dag(nodes: list, edges: list) -> bool:
    ordered_node_ids = [node_get(node, "id") for node in nodes]
    node_ids = set(ordered_node_ids)
    in_degree = {node_id: 0 for node_id in ordered_node_ids}
    adjacency = defaultdict(list)

    for edge in edges:
        source = edge_get(edge, "source")
        target = edge_get(edge, "target")
        if source not in node_ids or target not in node_ids:
            return False
        adjacency[source].append(target)
        in_degree[target] += 1

    queue = deque(node_id for node_id in ordered_node_ids if in_degree[node_id] == 0)
    visited = 0

    while queue:
        node_id = queue.popleft()
        visited += 1
        for neighbor in adjacency[node_id]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    return visited == len(node_ids)


def topological_sort(nodes: list, edges: list) -> list:
    ordered_node_ids = [node_get(node, "id") for node in nodes]
    node_ids = set(ordered_node_ids)
    in_degree = {node_id: 0 for node_id in ordered_node_ids}
    adjacency = defaultdict(list)

    for edge in edges:
        source = edge_get(edge, "source")
        target = edge_get(edge, "target")
        if source not in node_ids or target not in node_ids:
            raise ValueError(f"Edge references missing node: {source} -> {target}")
        adjacency[source].append(target)
        in_degree[target] += 1

    queue = deque(node_id for node_id in ordered_node_ids if in_degree[node_id] == 0)
    order = []

    while queue:
        node_id = queue.popleft()
        order.append(node_id)
        for neighbor in adjacency[node_id]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    if len(order) != len(node_ids):
        raise ValueError("Pipeline contains a cycle")
    return order


def parse_input_value(value: Any, input_type: str) -> Any:
    if value is None:
        value = ""
    if input_type == "Number":
        try:
            return float(value) if "." in str(value) else int(value)
        except (TypeError, ValueError):
            return 0
    if input_type == "Boolean":
        if isinstance(value, bool):
            return value
        return str(value).strip().lower() in {"true", "1", "yes", "on"}
    if input_type == "JSON":
        if isinstance(value, (dict, list)):
            return value
        try:
            return json.loads(value)
        except (TypeError, json.JSONDecodeError):
            return {}
    return str(value)


def render_template(value: Any, inputs: Dict[str, Any]) -> Any:
    if not isinstance(value, str):
        return value

    def replace(match):
        variable = match.group(1)
        replacement = inputs.get(variable, "")
        if isinstance(replacement, (dict, list)):
            return json.dumps(replacement)
        return str(replacement)

    return VARIABLE_RE.sub(replace, value)


def extract_json_path(value: Any, path: str) -> Any:
    if isinstance(value, str):
        value = json.loads(value)
    result = value
    if not path:
        return result

    for part in path.split("."):
        if isinstance(result, dict):
            result = result[part]
        elif isinstance(result, list):
            result = result[int(part)]
        else:
            raise KeyError(part)
    return result


def is_private_host(hostname: str) -> bool:
    if not hostname:
        return True
    if hostname.lower() in {"localhost", "127.0.0.1", "::1"}:
        return True
    try:
        addresses = socket.getaddrinfo(hostname, None)
    except socket.gaierror:
        return True
    for address in addresses:
        ip = ipaddress.ip_address(address[4][0])
        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_multicast:
            return True
    return False


def validate_public_url(url: str) -> None:
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"}:
        raise ValueError("Only http and https URLs are allowed")
    if is_private_host(parsed.hostname or ""):
        raise ValueError("Private, local, or unresolved API hosts are blocked")


def read_limited_response(response) -> bytes:
    data = response.read(MAX_RESPONSE_BYTES + 1)
    if len(data) > MAX_RESPONSE_BYTES:
        raise ValueError("Response exceeded the 1 MB limit")
    return data


def http_json_request(url: str, method: str, headers: Dict[str, str], body: Any, timeout: float) -> Dict[str, Any]:
    payload = None
    request_headers = dict(headers)
    request_headers.setdefault("User-Agent", "VectorShift-Workflow-Executor/1.0")
    if body not in (None, ""):
        payload = body if isinstance(body, str) else json.dumps(body)
        request_headers.setdefault("Content-Type", "application/json")
        payload = payload.encode("utf-8")

    request = Request(url=url, method=method, headers=request_headers, data=payload)
    try:
        with urlopen(request, timeout=timeout) as response:
            raw = read_limited_response(response)
            text = raw.decode("utf-8", errors="replace")
            try:
                parsed_body = json.loads(text)
            except json.JSONDecodeError:
                parsed_body = text
            return {
                "status_code": response.status,
                "headers": dict(response.headers),
                "body": parsed_body,
                "text": text,
            }
    except HTTPError as exc:
        raw = exc.read(MAX_RESPONSE_BYTES)
        text = raw.decode("utf-8", errors="replace")
        raise ValueError(f"HTTP {exc.code}: {text[:500]}") from exc
    except URLError as exc:
        raise ValueError(f"Request failed: {exc.reason}") from exc


def compare_values(left: Any, operator: str, right: Any) -> bool:
    if operator == "equals":
        return str(left) == str(right)
    if operator == "not_equals":
        return str(left) != str(right)
    if operator == "contains":
        return str(right) in str(left)
    if operator in {"gt", "lt"}:
        try:
            left_num = float(left)
            right_num = float(right)
        except (TypeError, ValueError):
            return False
        return left_num > right_num if operator == "gt" else left_num < right_num
    return False


class WorkflowExecutor:
    def __init__(self, pipeline: Pipeline):
        self.pipeline = pipeline
        self.nodes_by_id = {node.id: node for node in pipeline.nodes}
        self.edges_by_target = defaultdict(list)
        self.edges_by_source = defaultdict(list)
        for edge in pipeline.edges:
            self.edges_by_target[edge.target].append(edge)
            self.edges_by_source[edge.source].append(edge)

    def execute(self) -> Dict[str, Any]:
        if not check_is_dag(self.pipeline.nodes, self.pipeline.edges):
            return self.error_response(False, ["Pipeline is not a DAG or references missing nodes"])

        errors = []
        node_results = {}
        execution_order = topological_sort(self.pipeline.nodes, self.pipeline.edges)

        for node_id in execution_order:
            node = self.nodes_by_id[node_id]
            inputs = self.collect_inputs(node_id, node_results)

            if self.edges_by_target[node_id] and not inputs:
                node_results[node_id] = {
                    "status": "skipped",
                    "inputs": {},
                    "outputs": {},
                    "error": "No active upstream output reached this node",
                }
                continue

            result = self.execute_node(node, inputs)
            node_results[node_id] = result
            if result["status"] == "error":
                errors.append({"node_id": node_id, "error": result["error"]})

        final_outputs = self.collect_final_outputs(node_results)
        return {
            "status": "error" if errors else "success",
            "num_nodes": len(self.pipeline.nodes),
            "num_edges": len(self.pipeline.edges),
            "is_dag": True,
            "execution_order": execution_order,
            "node_results": node_results,
            "outputs": final_outputs,
            "errors": errors,
        }

    def error_response(self, is_dag: bool, errors: List[str]) -> Dict[str, Any]:
        return {
            "status": "error",
            "num_nodes": len(self.pipeline.nodes),
            "num_edges": len(self.pipeline.edges),
            "is_dag": is_dag,
            "execution_order": [],
            "node_results": {},
            "outputs": {},
            "errors": errors,
        }

    def collect_inputs(self, node_id: str, node_results: Dict[str, Any]) -> Dict[str, Any]:
        inputs = {}
        for edge in self.edges_by_target[node_id]:
            source_result = node_results.get(edge.source)
            if not source_result or source_result.get("status") in {"error", "skipped"}:
                continue
            source_port = port_name(edge.source, edge.sourceHandle, "output")
            target_port = port_name(edge.target, edge.targetHandle, "value")
            source_outputs = source_result.get("outputs", {})
            if source_port in source_outputs:
                inputs[target_port] = source_outputs[source_port]
        return inputs

    def collect_final_outputs(self, node_results: Dict[str, Any]) -> Dict[str, Any]:
        outputs = {}
        for node in self.pipeline.nodes:
            if node.type != "customOutput":
                continue
            result = node_results.get(node.id, {})
            if result.get("status") == "success":
                output_name = node.data.get("outputName") or node.id
                outputs[output_name] = result.get("outputs", {}).get("value")
        return outputs

    def success(self, inputs: Dict[str, Any], outputs: Dict[str, Any]) -> Dict[str, Any]:
        return {"status": "success", "inputs": inputs, "outputs": outputs, "error": None}

    def error(self, inputs: Dict[str, Any], message: str) -> Dict[str, Any]:
        return {"status": "error", "inputs": inputs, "outputs": {}, "error": message}

    def execute_node(self, node: Node, inputs: Dict[str, Any]) -> Dict[str, Any]:
        try:
            if node.type == "customInput":
                value = parse_input_value(node.data.get("defaultValue", ""), node.data.get("inputType", "Text"))
                return self.success(inputs, {"value": value})
            if node.type == "text":
                text = render_template(node.data.get("text", ""), inputs)
                return self.success(inputs, {"output": text})
            if node.type == "llm":
                return self.execute_llm(node, inputs)
            if node.type == "api":
                return self.execute_api(node, inputs)
            if node.type == "jsonParser":
                source = inputs.get("json", inputs.get("value", next(iter(inputs.values()), {})))
                parsed = extract_json_path(source, node.data.get("jsonPath", ""))
                return self.success(inputs, {"parsed": parsed})
            if node.type == "condition":
                value = inputs.get("value", "")
                compare_to = inputs.get("cond", node.data.get("value", ""))
                passed = compare_values(value, node.data.get("operator", "equals"), compare_to)
                return self.success(inputs, {"true" if passed else "false": value, "passed": passed})
            if node.type == "delay":
                return self.execute_delay(node, inputs)
            if node.type == "email":
                return self.execute_email(node, inputs)
            if node.type == "customOutput":
                return self.success(inputs, {"value": inputs.get("value", next(iter(inputs.values()), None))})
            return self.error(inputs, f"Unknown node type: {node.type}")
        except Exception as exc:
            return self.error(inputs, str(exc))

    def execute_delay(self, node: Node, inputs: Dict[str, Any]) -> Dict[str, Any]:
        duration = float(node.data.get("duration", 0) or 0)
        unit = node.data.get("unit", "Seconds")
        multiplier = {"Milliseconds": 0.001, "Seconds": 1, "Minutes": 60, "Hours": 3600}.get(unit, 1)
        wait_seconds = min(max(duration * multiplier, 0), env_float("MAX_DELAY_SECONDS", 5))
        if wait_seconds:
            time.sleep(wait_seconds)
        return self.success(inputs, {"output": inputs.get("input", next(iter(inputs.values()), None)), "waited_seconds": wait_seconds})

    def execute_email(self, node: Node, inputs: Dict[str, Any]) -> Dict[str, Any]:
        subject = render_template(node.data.get("subject", inputs.get("subject", "")), inputs)
        body = render_template(node.data.get("body", inputs.get("body", "")), inputs)
        return self.success(inputs, {
            "sent": {
                "status": "prepared",
                "to": node.data.get("to", ""),
                "subject": subject,
                "body": body,
                "message": "SMTP is not configured; email was prepared but not sent.",
            }
        })

    def execute_api(self, node: Node, inputs: Dict[str, Any]) -> Dict[str, Any]:
        method = str(node.data.get("method", "GET")).upper()
        if method not in {"GET", "POST", "PUT", "PATCH", "DELETE"}:
            raise ValueError(f"Unsupported API method: {method}")

        url = render_template(node.data.get("url", ""), inputs)
        validate_public_url(url)

        headers_raw = render_template(node.data.get("headers", "{}"), inputs)
        headers = json.loads(headers_raw) if headers_raw else {}
        if not isinstance(headers, dict):
            raise ValueError("API headers must be a JSON object")

        body = render_template(node.data.get("body", inputs.get("body", "")), inputs)
        response = http_json_request(url, method, headers, body, env_float("API_TIMEOUT_SECONDS", 12))
        return self.success(inputs, {"response": response["body"], "status_code": response["status_code"], "text": response["text"]})

    def execute_llm(self, node: Node, inputs: Dict[str, Any]) -> Dict[str, Any]:
        token = os.getenv("HF_TOKEN")
        if not token:
            raise ValueError("HF_TOKEN is not configured")

        model_id = os.getenv("HF_MODEL_ID", HF_DEFAULT_MODEL_ID)
        url = os.getenv("HF_API_BASE", HF_DEFAULT_API_BASE)
        host = urlparse(url).hostname or ""
        if "groq.com" in host:
            raise ValueError(
                "LLM endpoint is configured as Groq, which returned Cloudflare 403. "
                f"Set HF_API_BASE={HF_DEFAULT_API_BASE} and use a Hugging Face token in HF_TOKEN."
            )
        if "huggingface.co" not in host:
            raise ValueError(
                "LLM endpoint must be a Hugging Face Inference Providers endpoint. "
                f"Set HF_API_BASE={HF_DEFAULT_API_BASE}."
            )
        prompt = str(inputs.get("prompt", inputs.get("value", "")))
        system = str(inputs.get("system", node.data.get("systemPrompt", "You are a helpful assistant.")))

        payload = {
            "model": model_id,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
            "temperature": float(node.data.get("temperature", 0.7) or 0.7),
            "max_tokens": int(node.data.get("maxTokens", 512) or 512),
        }
        response = http_json_request(
            url,
            "POST",
            {"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            payload,
            env_float("API_TIMEOUT_SECONDS", 30),
        )
        body = response["body"]
        content = body["choices"][0]["message"]["content"]
        return self.success(inputs, {"response": content, "raw": body, "model": model_id})


@app.get("/")
def read_root():
    return {"Ping": "Pong"}


@app.post("/pipelines/parse")
def parse_pipeline(pipeline: Pipeline):
    return {
        "num_nodes": len(pipeline.nodes),
        "num_edges": len(pipeline.edges),
        "is_dag": check_is_dag(pipeline.nodes, pipeline.edges),
    }


@app.post("/pipelines/execute")
def execute_pipeline(pipeline: Pipeline):
    return WorkflowExecutor(pipeline).execute()
