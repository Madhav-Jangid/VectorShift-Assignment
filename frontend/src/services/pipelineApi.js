const API_BASE_URL = process.env.REACT_APP_BACKEND_URL?.replace(/\/+$/, '');

function getPipelineUrl(path) {
  if (!API_BASE_URL) {
    throw new Error('Missing REACT_APP_BACKEND_URL environment variable');
  }

  return `${API_BASE_URL}${path}`;
}

export async function submitPipeline(nodes, edges) {
  const response = await fetch(getPipelineUrl('/pipelines/parse'), {
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
  const response = await fetch(getPipelineUrl('/pipelines/execute'), {
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
