const EDGE_BASE = {
  type: 'flow',
  animated: false,
  style: { stroke: 'var(--edge-color)', strokeWidth: 2 },
};

export const QA_CHATBOT = {
  id: 'qa-chatbot',
  name: 'Q&A Chatbot',
  description: 'User asks a question -> LLM responds. A minimal chat pipeline.',
  nodes: [
    {
      id: 'w1-input-1',
      type: 'customInput',
      position: { x: 60, y: 210 },
      data: {
        id: 'w1-input-1',
        nodeType: 'customInput',
        inputName: 'question',
        inputType: 'Text',
      },
    },
    {
      id: 'w1-text-1',
      type: 'text',
      position: { x: 360, y: 150 },
      data: {
        id: 'w1-text-1',
        nodeType: 'text',
        // question creates a target handle on the text node
        text: 'Answer the following question clearly and concisely:\n\n{{question}}',
      },
    },
    {
      id: 'w1-llm-1',
      type: 'llm',
      position: { x: 700, y: 150 },
      data: {
        id: 'w1-llm-1',
        nodeType: 'llm',
        model: 'gpt-4o',
      },
    },
    {
      id: 'w1-output-1',
      type: 'customOutput',
      position: { x: 1020, y: 210 },
      data: {
        id: 'w1-output-1',
        nodeType: 'customOutput',
        outputName: 'answer',
        outputType: 'Text',
      },
    },
  ],
  edges: [
    {
      ...EDGE_BASE,
      id: 'w1-e1',
      source: 'w1-input-1',
      sourceHandle: 'w1-input-1-value',
      target: 'w1-text-1',
      targetHandle: 'w1-text-1-question',
    },
    {
      ...EDGE_BASE,
      id: 'w1-e2',
      source: 'w1-text-1',
      sourceHandle: 'w1-text-1-output',
      target: 'w1-llm-1',
      targetHandle: 'w1-llm-1-prompt',
    },
    {
      ...EDGE_BASE,
      id: 'w1-e3',
      source: 'w1-llm-1',
      sourceHandle: 'w1-llm-1-response',
      target: 'w1-output-1',
      targetHandle: 'w1-output-1-value',
    },
  ],
  preview: [
    { color: '#10B981', label: 'Input' },
    { color: '#EC4899', label: 'Text' },
    { color: '#6366F1', label: 'LLM' },
    { color: '#F59E0B', label: 'Output' },
  ],
};

export const API_SUMMARIZER = {
  id: 'api-summarizer',
  name: 'API Data Summarizer',
  description: 'Fetch data from an API, extract a field, summarize with an LLM.',
  nodes: [
    {
      id: 'w2-input-1',
      type: 'customInput',
      position: { x: 60, y: 230 },
      data: {
        id: 'w2-input-1',
        nodeType: 'customInput',
        inputName: 'api_url',
        inputType: 'Text',
      },
    },
    {
      id: 'w2-api-1',
      type: 'api',
      position: { x: 340, y: 160 },
      data: {
        id: 'w2-api-1',
        nodeType: 'api',
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/todos/1',
      },
    },
    {
      id: 'w2-json-1',
      type: 'jsonParser',
      position: { x: 640, y: 160 },
      data: {
        id: 'w2-json-1',
        nodeType: 'jsonParser',
        jsonPath: 'title',
      },
    },
    {
      id: 'w2-llm-1',
      type: 'llm',
      position: { x: 940, y: 160 },
      data: {
        id: 'w2-llm-1',
        nodeType: 'llm',
        model: 'gpt-4o-mini',
      },
    },
    {
      id: 'w2-output-1',
      type: 'customOutput',
      position: { x: 1260, y: 230 },
      data: {
        id: 'w2-output-1',
        nodeType: 'customOutput',
        outputName: 'summary',
        outputType: 'Text',
      },
    },
  ],
  edges: [
    {
      ...EDGE_BASE,
      id: 'w2-e1',
      source: 'w2-input-1',
      sourceHandle: 'w2-input-1-value',
      target: 'w2-api-1',
      targetHandle: 'w2-api-1-body',
    },
    {
      ...EDGE_BASE,
      id: 'w2-e2',
      source: 'w2-api-1',
      sourceHandle: 'w2-api-1-response',
      target: 'w2-json-1',
      targetHandle: 'w2-json-1-json',
    },
    {
      ...EDGE_BASE,
      id: 'w2-e3',
      source: 'w2-json-1',
      sourceHandle: 'w2-json-1-parsed',
      target: 'w2-llm-1',
      targetHandle: 'w2-llm-1-prompt',
    },
    {
      ...EDGE_BASE,
      id: 'w2-e4',
      source: 'w2-llm-1',
      sourceHandle: 'w2-llm-1-response',
      target: 'w2-output-1',
      targetHandle: 'w2-output-1-value',
    },
  ],
  preview: [
    { color: '#10B981', label: 'Input' },
    { color: '#0EA5E9', label: 'API' },
    { color: '#8B5CF6', label: 'JSON' },
    { color: '#6366F1', label: 'LLM' },
    { color: '#F59E0B', label: 'Output' },
  ],
};

export const INCIDENT_BRIEFING_COPILOT = {
  id: 'vectorshift-diligence-copilot',
  name: 'VectorShift Diligence Copilot',
  description: 'Turn live deal signals into a sourced investment-team memo, prepare follow-up email, and return the audit trail.',
  nodes: [
    {
      id: 'w3-input-1',
      type: 'customInput',
      position: { x: 40, y: 300 },
      data: {
        id: 'w3-input-1',
        nodeType: 'customInput',
        inputName: 'audience',
        inputType: 'Text',
        defaultValue: 'private equity investment committee',
      },
    },
    {
      id: 'w3-api-1',
      type: 'api',
      position: { x: 300, y: 120 },
      data: {
        id: 'w3-api-1',
        nodeType: 'api',
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/todos/1',
      },
    },
    {
      id: 'w3-json-1',
      type: 'jsonParser',
      position: { x: 580, y: 120 },
      data: {
        id: 'w3-json-1',
        nodeType: 'jsonParser',
        jsonPath: 'title',
      },
    },
    {
      id: 'w3-condition-1',
      type: 'condition',
      position: { x: 860, y: 110 },
      data: {
        id: 'w3-condition-1',
        nodeType: 'condition',
        operator: 'contains',
        value: 'aut',
      },
    },
    {
      id: 'w3-text-1',
      type: 'text',
      position: { x: 1140, y: 170 },
      data: {
        id: 'w3-text-1',
        nodeType: 'text',
        text:
          'You are demoing VectorShift: one platform for agentic AI financial workflows.\n\n' +
          'Create a concise private-market diligence memo for a {{audience}}.\n\n' +
          'Live external signal extracted from an API: {{brief}}\n\n' +
          'Show how VectorShift would combine a unified knowledge layer, source traceability, end-to-end automation, and pre-built workflows for investment firms.\n\n' +
          'Include: deal relevance, diligence questions, risks to investigate, next workflow action, and an email-ready summary.',
      },
    },
    {
      id: 'w3-llm-1',
      type: 'llm',
      position: { x: 1460, y: 170 },
      data: {
        id: 'w3-llm-1',
        nodeType: 'llm',
        systemPrompt: 'You are VectorShift for investment firms. Be concise, sourced-sounding, executive-ready, and focused on finance workflows.',
        temperature: 0.4,
        maxTokens: 300,
      },
    },
    {
      id: 'w3-delay-1',
      type: 'delay',
      position: { x: 1740, y: 170 },
      data: {
        id: 'w3-delay-1',
        nodeType: 'delay',
        duration: 500,
        unit: 'Milliseconds',
      },
    },
    {
      id: 'w3-email-1',
      type: 'email',
      position: { x: 2020, y: 165 },
      data: {
        id: 'w3-email-1',
        nodeType: 'email',
        to: 'deal-team@vectorshift-demo.com',
        subject: 'VectorShift diligence memo prepared by workflow',
        body: '{{body}}',
      },
    },
    {
      id: 'w3-output-1',
      type: 'customOutput',
      position: { x: 2320, y: 230 },
      data: {
        id: 'w3-output-1',
        nodeType: 'customOutput',
        outputName: 'vectorshift_diligence_packet',
        outputType: 'JSON',
      },
    },
  ],
  edges: [
    {
      ...EDGE_BASE,
      id: 'w3-e1',
      source: 'w3-api-1',
      sourceHandle: 'w3-api-1-response',
      target: 'w3-json-1',
      targetHandle: 'w3-json-1-json',
    },
    {
      ...EDGE_BASE,
      id: 'w3-e2',
      source: 'w3-json-1',
      sourceHandle: 'w3-json-1-parsed',
      target: 'w3-condition-1',
      targetHandle: 'w3-condition-1-value',
    },
    {
      ...EDGE_BASE,
      id: 'w3-e3',
      source: 'w3-condition-1',
      sourceHandle: 'w3-condition-1-true',
      target: 'w3-text-1',
      targetHandle: 'w3-text-1-brief',
    },
    {
      ...EDGE_BASE,
      id: 'w3-e4',
      source: 'w3-input-1',
      sourceHandle: 'w3-input-1-value',
      target: 'w3-text-1',
      targetHandle: 'w3-text-1-audience',
    },
    {
      ...EDGE_BASE,
      id: 'w3-e5',
      source: 'w3-text-1',
      sourceHandle: 'w3-text-1-output',
      target: 'w3-llm-1',
      targetHandle: 'w3-llm-1-prompt',
    },
    {
      ...EDGE_BASE,
      id: 'w3-e6',
      source: 'w3-llm-1',
      sourceHandle: 'w3-llm-1-response',
      target: 'w3-delay-1',
      targetHandle: 'w3-delay-1-input',
    },
    {
      ...EDGE_BASE,
      id: 'w3-e7',
      source: 'w3-delay-1',
      sourceHandle: 'w3-delay-1-output',
      target: 'w3-email-1',
      targetHandle: 'w3-email-1-body',
    },
    {
      ...EDGE_BASE,
      id: 'w3-e8',
      source: 'w3-email-1',
      sourceHandle: 'w3-email-1-sent',
      target: 'w3-output-1',
      targetHandle: 'w3-output-1-value',
    },
  ],
  preview: [
    { color: '#10B981', label: 'Input' },
    { color: '#0EA5E9', label: 'API' },
    { color: '#8B5CF6', label: 'JSON' },
    { color: '#EF4444', label: 'Condition' },
    { color: '#EC4899', label: 'Text' },
    { color: '#6366F1', label: 'LLM' },
    { color: '#F97316', label: 'Delay' },
    { color: '#06B6D4', label: 'Email' },
    { color: '#F59E0B', label: 'Output' },
  ],
};

export const SAMPLE_WORKFLOWS = [INCIDENT_BRIEFING_COPILOT, QA_CHATBOT, API_SUMMARIZER];
