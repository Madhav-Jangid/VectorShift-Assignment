const API_BASE_URL = 'http://localhost:8000';

export async function submitPipeline(nodes, edges) {
  const response = await fetch(`${API_BASE_URL}/pipelines/parse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nodes, edges }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => `HTTP ${response.status}`);
    throw new Error(text || `Server returned ${response.status}`);
  }

  return response.json();
}

export async function executePipeline(nodes, edges) {
  const response = await fetch(`${API_BASE_URL}/pipelines/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nodes, edges }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => `HTTP ${response.status}`);
    throw new Error(text || `Server returned ${response.status}`);
  }

  return response.json();
}
