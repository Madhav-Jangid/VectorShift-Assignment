import unittest
import sys
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent))

from main import Pipeline, WorkflowExecutor, check_is_dag, port_name, topological_sort


def pipeline(nodes, edges):
    return Pipeline(nodes=nodes, edges=edges)


class WorkflowExecutorTests(unittest.TestCase):
    def test_dag_validation_and_order(self):
        data = pipeline(
            nodes=[
                {"id": "in1", "type": "customInput", "data": {}},
                {"id": "txt1", "type": "text", "data": {}},
                {"id": "out1", "type": "customOutput", "data": {}},
            ],
            edges=[
                {"source": "in1", "target": "txt1"},
                {"source": "txt1", "target": "out1"},
            ],
        )

        self.assertTrue(check_is_dag(data.nodes, data.edges))
        self.assertEqual(topological_sort(data.nodes, data.edges), ["in1", "txt1", "out1"])

    def test_cycle_and_missing_edge_rejected(self):
        cyclic = pipeline(
            nodes=[
                {"id": "a", "type": "customInput", "data": {}},
                {"id": "b", "type": "text", "data": {}},
            ],
            edges=[
                {"source": "a", "target": "b"},
                {"source": "b", "target": "a"},
            ],
        )
        missing = pipeline(
            nodes=[{"id": "a", "type": "customInput", "data": {}}],
            edges=[{"source": "a", "target": "missing"}],
        )

        self.assertFalse(check_is_dag(cyclic.nodes, cyclic.edges))
        self.assertFalse(check_is_dag(missing.nodes, missing.edges))

    def test_port_name_extraction(self):
        self.assertEqual(port_name("node-1", "node-1-output", "value"), "output")
        self.assertEqual(port_name("node-1", None, "value"), "value")
        self.assertEqual(port_name("node-1", "external-handle", "value"), "external-handle")

    def test_input_text_output_flow_uses_handles(self):
        data = pipeline(
            nodes=[
                {"id": "in1", "type": "customInput", "data": {"inputType": "Text", "defaultValue": "Ada"}},
                {"id": "txt1", "type": "text", "data": {"text": "Hello {{name}}"}},
                {"id": "out1", "type": "customOutput", "data": {"outputName": "message"}},
            ],
            edges=[
                {"source": "in1", "sourceHandle": "in1-value", "target": "txt1", "targetHandle": "txt1-name"},
                {"source": "txt1", "sourceHandle": "txt1-output", "target": "out1", "targetHandle": "out1-value"},
            ],
        )

        result = WorkflowExecutor(data).execute()

        self.assertEqual(result["status"], "success")
        self.assertEqual(result["outputs"]["message"], "Hello Ada")

    @patch("main.http_json_request")
    def test_api_json_parser_flow(self, mock_request):
        mock_request.return_value = {
            "status_code": 200,
            "body": {"results": {"summary": "ready"}},
            "text": '{"results":{"summary":"ready"}}',
        }
        data = pipeline(
            nodes=[
                {"id": "api1", "type": "api", "data": {"method": "GET", "url": "https://example.com/data"}},
                {"id": "json1", "type": "jsonParser", "data": {"jsonPath": "results.summary"}},
                {"id": "out1", "type": "customOutput", "data": {"outputName": "summary"}},
            ],
            edges=[
                {"source": "api1", "sourceHandle": "api1-response", "target": "json1", "targetHandle": "json1-json"},
                {"source": "json1", "sourceHandle": "json1-parsed", "target": "out1", "targetHandle": "out1-value"},
            ],
        )

        with patch("main.validate_public_url"):
            result = WorkflowExecutor(data).execute()

        self.assertEqual(result["status"], "success")
        self.assertEqual(result["outputs"]["summary"], "ready")

    def test_condition_branches_skip_inactive_path(self):
        data = pipeline(
            nodes=[
                {"id": "in1", "type": "customInput", "data": {"defaultValue": "yes"}},
                {"id": "cond1", "type": "condition", "data": {"operator": "equals", "value": "yes"}},
                {"id": "trueOut", "type": "customOutput", "data": {"outputName": "true_path"}},
                {"id": "falseOut", "type": "customOutput", "data": {"outputName": "false_path"}},
            ],
            edges=[
                {"source": "in1", "sourceHandle": "in1-value", "target": "cond1", "targetHandle": "cond1-value"},
                {"source": "cond1", "sourceHandle": "cond1-true", "target": "trueOut", "targetHandle": "trueOut-value"},
                {"source": "cond1", "sourceHandle": "cond1-false", "target": "falseOut", "targetHandle": "falseOut-value"},
            ],
        )

        result = WorkflowExecutor(data).execute()

        self.assertEqual(result["status"], "success")
        self.assertEqual(result["outputs"]["true_path"], "yes")
        self.assertNotIn("false_path", result["outputs"])
        self.assertEqual(result["node_results"]["falseOut"]["status"], "skipped")

    @patch.dict("os.environ", {}, clear=True)
    def test_llm_reports_missing_token(self):
        data = pipeline(
            nodes=[{"id": "llm1", "type": "llm", "data": {}}],
            edges=[],
        )

        result = WorkflowExecutor(data).execute()

        self.assertEqual(result["status"], "error")
        self.assertIn("HF_TOKEN", result["errors"][0]["error"])

    @patch.dict("os.environ", {"HF_TOKEN": "hf_test", "HF_API_BASE": "https://api.groq.com/openai/v1/chat/completions"}, clear=True)
    def test_llm_rejects_groq_endpoint(self):
        data = pipeline(
            nodes=[{"id": "llm1", "type": "llm", "data": {}}],
            edges=[],
        )

        result = WorkflowExecutor(data).execute()

        self.assertEqual(result["status"], "error")
        self.assertIn("configured as Groq", result["errors"][0]["error"])


if __name__ == "__main__":
    unittest.main()
