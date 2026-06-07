import { useStore } from '../../app/store';
import { shallow } from 'zustand/shallow';

const NODE_META = {
  customInput: {
    label: 'Input',
    accent: '#10B981',
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 8h10M9 4l4 4-4 4" />
      </svg>
    ),
    fields: [
      { key: 'inputName', label: 'Name', type: 'text', placeholder: 'input_name' },
      { key: 'inputType', label: 'Data type', type: 'select', options: ['Text', 'File', 'Number', 'Boolean', 'JSON'] },
      { key: 'defaultValue', label: 'Default value', type: 'textarea', placeholder: 'Value used when the workflow runs', rows: 3 },
    ],
    tips: [
      'The name becomes a {{variable}} you can reference in downstream Text or Prompt nodes.',
      'Connect the right-side handle to any node that should receive this input.',
      'Use descriptive names like user_query or file_path to keep pipelines readable.',
    ],
  },
  customOutput: {
    label: 'Output',
    accent: '#F59E0B',
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 8H3M7 4L3 8l4 4" />
      </svg>
    ),
    fields: [
      { key: 'outputName', label: 'Name', type: 'text', placeholder: 'output_name' },
      { key: 'outputType', label: 'Data type', type: 'select', options: ['Text', 'File', 'Number', 'Boolean', 'JSON'] },
    ],
    tips: [
      'Captures the final result of your pipeline and surfaces it to the caller.',
      'Connect the left-side handle to any upstream node whose value you want to collect.',
      'Multiple Output nodes let you return several values from one pipeline.',
    ],
  },
  llm: {
    label: 'LLM',
    accent: '#6366F1',
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="8" height="8" rx="1" />
        <path d="M6.5 1.5v2.5M9.5 1.5v2.5M6.5 12v2.5M9.5 12v2.5M1.5 6.5h2.5M1.5 9.5h2.5M12 6.5h2.5M12 9.5h2.5" />
      </svg>
    ),
    fields: [
      { key: 'modelLocked', label: 'Model', type: 'locked', value: 'Hugging Face default' },
      { key: 'systemPrompt', label: 'System prompt', type: 'textarea', placeholder: 'You are a helpful assistant.' },
      { key: 'temperature', label: 'Temperature', type: 'number', placeholder: '0.7', min: 0, max: 2, step: 0.1 },
      { key: 'maxTokens', label: 'Max tokens', type: 'number', placeholder: '1024', min: 1 },
    ],
    tips: [
      'Connect a Text node to the prompt handle to pass dynamic prompts.',
      'Lower temperature (0-0.3) gives consistent outputs; higher (0.7-1.2) gives creative ones.',
      "The system prompt sets the model's persona and constraints -- keep it concise.",
    ],
  },
  text: {
    label: 'Text / Prompt',
    accent: '#EC4899',
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3.5 4h9M8 4v8M5.5 12h5" />
      </svg>
    ),
    fields: [
      { key: 'text', label: 'Content', type: 'textarea', placeholder: 'Enter text or use {{variable}} to reference inputs...', rows: 6 },
    ],
    tips: [
      'Use {{variableName}} to inject values from upstream Input nodes at runtime.',
      'Example: "Summarise the following: {{user_text}}" -- user_text must match an Input node name.',
      "Connect the output to an LLM node's prompt handle to build dynamic prompts.",
    ],
  },
  condition: {
    label: 'Condition',
    accent: '#EF4444',
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 2l5.5 6L8 14l-5.5-6z" />
      </svg>
    ),
    fields: [
      { key: 'condition', label: 'Expression', type: 'text', placeholder: 'value > 0' },
    ],
    tips: [
      'Write a boolean expression that references upstream variable names.',
      'The top handle fires on true; the bottom handle fires on false.',
      'Supported operators: ==, !=, >, <, >=, <=, &&, ||, !',
    ],
  },
  jsonParser: {
    label: 'JSON Parser',
    accent: '#8B5CF6',
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5.5 3C4 3 3.5 3.6 3.5 5v1.5c0 .7-.5 1-1 1.5.5.5 1 .8 1 1.5V11c0 1.4.5 2 2 2" />
        <path d="M10.5 3C12 3 12.5 3.6 12.5 5v1.5c0 .7.5 1 1 1.5-.5.5-1 .8-1 1.5V11c0 1.4-.5 2-2 2" />
      </svg>
    ),
    fields: [
      { key: 'jsonPath', label: 'Key path', type: 'text', placeholder: 'user.address.city' },
      { key: 'fallback', label: 'Default value', type: 'text', placeholder: '' },
    ],
    tips: [
      'Use dot notation to navigate nested objects: data.items[0].name',
      'If the path is not found, the default value is passed downstream.',
      'Connect a JSON string from an API Call or Input node to the input handle.',
    ],
  },
  api: {
    label: 'API Call',
    accent: '#0EA5E9',
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2.5l-5 6h4.5l-2.5 5 6.5-8H8.5l1-3z" />
      </svg>
    ),
    fields: [
      { key: 'method', label: 'Method', type: 'select', options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] },
      { key: 'url', label: 'URL', type: 'text', placeholder: 'https://api.example.com/endpoint' },
      { key: 'headers', label: 'Headers (JSON)', type: 'textarea', placeholder: '{\n  "Authorization": "Bearer {{token}}"\n}' },
      { key: 'body', label: 'Body (JSON)', type: 'textarea', placeholder: '{\n  "query": "{{user_input}}"\n}' },
    ],
    tips: [
      'Use {{variable}} anywhere in the URL, headers, or body to inject runtime values.',
      'The full response body (as a string) is passed to downstream nodes.',
      'Add a JSON Parser node after this to extract specific fields from the response.',
    ],
  },
  email: {
    label: 'Email',
    accent: '#06B6D4',
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="12" height="9" rx="1.5" />
        <path d="M2 5.5l6 4.5 6-4.5" />
      </svg>
    ),
    fields: [
      { key: 'to', label: 'To', type: 'text', placeholder: 'recipient@example.com' },
      { key: 'subject', label: 'Subject', type: 'text', placeholder: 'Pipeline notification' },
      { key: 'body', label: 'Message', type: 'textarea', placeholder: 'Your pipeline completed.\n\nResult: {{result}}' },
    ],
    tips: [
      'Use {{variable}} in subject and body to include runtime values from the pipeline.',
      'Place this node near the end of your pipeline as a notification step.',
      'Separate multiple recipients with commas in the To field.',
    ],
  },
  delay: {
    label: 'Delay',
    accent: '#F97316',
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8.5" r="5.5" />
        <path d="M8 6v2.5l2 2" />
      </svg>
    ),
    fields: [
      { key: 'duration', label: 'Duration', type: 'number', placeholder: '1000', min: 0 },
      { key: 'unit', label: 'Unit', type: 'select', options: ['Milliseconds', 'Seconds', 'Minutes', 'Hours'] },
    ],
    tips: [
      'Pauses execution before continuing to the next node.',
      'Useful for rate-limiting API calls or waiting for async operations to settle.',
      'For retries, chain multiple Delay nodes with Condition nodes between them.',
    ],
  },
};

const FieldLabel = ({ children }) => (
  <div
    className="font-mono uppercase mb-[5px]"
    style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.12em', color: 'var(--ctrl-muted)' }}
  >
    {children}
  </div>
);

const inputBase = {
  width: '100%',
  background: 'var(--surface)',
  border: '1px solid var(--ctrl-border)',
  borderRadius: 6,
  color: 'var(--ctrl-ink)',
  fontSize: '13px',
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'border-color 0.12s',
};

const TextField = ({ value, placeholder, onChange }) => (
  <input
    type="text"
    value={value ?? ''}
    placeholder={placeholder}
    onChange={(e) => onChange(e.target.value)}
    className="font-sans"
    style={{ ...inputBase, padding: '7px 10px' }}
    onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
    onBlur={(e) => (e.target.style.borderColor = 'var(--ctrl-border)')}
  />
);

const NumberField = ({ value, placeholder, min, max, step, onChange }) => (
  <input
    type="number"
    value={value ?? ''}
    placeholder={placeholder}
    min={min} max={max} step={step ?? 1}
    onChange={(e) => onChange(e.target.value)}
    className="font-mono"
    style={{ ...inputBase, padding: '7px 10px' }}
    onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
    onBlur={(e) => (e.target.style.borderColor = 'var(--ctrl-border)')}
  />
);

const TextareaField = ({ value, placeholder, rows, onChange }) => (
  <textarea
    value={value ?? ''}
    placeholder={placeholder}
    rows={rows ?? 4}
    onChange={(e) => onChange(e.target.value)}
    className="font-sans resize-y"
    style={{ ...inputBase, padding: '8px 10px', lineHeight: 1.5 }}
    onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
    onBlur={(e) => (e.target.style.borderColor = 'var(--ctrl-border)')}
  />
);

const SelectField = ({ value, options, onChange }) => (
  <select
    value={value ?? options[0]}
    onChange={(e) => onChange(e.target.value)}
    className="font-sans cursor-pointer"
    style={{ ...inputBase, padding: '7px 10px', appearance: 'none' }}
  >
    {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
  </select>
);

const LockedField = ({ value }) => (
  <button
    type="button"
    disabled
    className="font-sans"
    style={{
      ...inputBase,
      padding: '7px 10px',
      textAlign: 'left',
      opacity: 0.68,
      cursor: 'not-allowed',
    }}
  >
    {value}
  </button>
);

const TipItem = ({ text }) => (
  <div className="flex gap-2">
    <div className="shrink-0 w-[5px] h-[5px] rounded-full mt-[6px]" style={{ background: 'var(--dim)' }} />
    <p className="font-sans" style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.55, margin: 0 }}>{text}</p>
  </div>
);

const panelSelector = (s) => ({
  selectedNodes: s.selectedNodes,
  nodes: s.nodes,
  updateNodeField: s.updateNodeField,
});

export const NodePropertiesPanel = ({ open }) => {
  const { selectedNodes, nodes, updateNodeField } = useStore(panelSelector, shallow);

  const selectedNode = open ? nodes.find((n) => n.id === selectedNodes[0]?.id) : null;
  const meta = selectedNode ? NODE_META[selectedNode.type] : null;

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: 'var(--ctrl-bg)' }}>
      {meta && selectedNode ? (
        <>
          <div
            className="flex items-center gap-3 px-4 py-4 shrink-0"
            style={{ borderBottom: '1px solid var(--ctrl-border)' }}
          >
            <div
              className="w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0"
              style={{ background: meta.accent + '18', color: meta.accent }}
            >
              {meta.icon}
            </div>
            <div className="min-w-0">
              <div
                className="font-sans font-medium leading-[1.2] truncate"
                style={{ fontSize: '14px', color: 'var(--ctrl-ink)', letterSpacing: '-0.01em' }}
              >
                {meta.label}
              </div>
              <div
                className="font-mono truncate"
                style={{ fontSize: '10px', color: 'var(--ctrl-muted)', letterSpacing: '0.04em', marginTop: 1 }}
              >
                {selectedNode.id}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-4 flex flex-col gap-4">
              {meta.fields.map((field) => (
                <div key={field.key}>
                  <FieldLabel>{field.label}</FieldLabel>
                  {field.type === 'text' && <TextField value={selectedNode.data[field.key]} placeholder={field.placeholder} onChange={(v) => updateNodeField(selectedNode.id, field.key, v)} />}
                  {field.type === 'number' && <NumberField value={selectedNode.data[field.key]} placeholder={field.placeholder} min={field.min} max={field.max} step={field.step} onChange={(v) => updateNodeField(selectedNode.id, field.key, v)} />}
                  {field.type === 'textarea' && <TextareaField value={selectedNode.data[field.key]} placeholder={field.placeholder} rows={field.rows} onChange={(v) => updateNodeField(selectedNode.id, field.key, v)} />}
                  {field.type === 'select' && <SelectField value={selectedNode.data[field.key]} options={field.options} onChange={(v) => updateNodeField(selectedNode.id, field.key, v)} />}
                  {field.type === 'locked' && <LockedField value={field.value} />}
                </div>
              ))}
            </div>
          </div>

          <div
            className="shrink-0 px-4 py-4 flex flex-col gap-[10px]"
            style={{ borderTop: '1px solid var(--ctrl-border)', background: 'var(--surface)' }}
          >
            <div className="flex items-center gap-2 mb-1" style={{ color: 'var(--ctrl-muted)' }}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="8" r="6.5" />
                <path d="M8 7.5v4M8 5.5v.5" strokeWidth="1.8" />
              </svg>
              <span className="font-mono uppercase" style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.12em' }}>
                How to use
              </span>
            </div>
            {meta.tips.map((tip, i) => <TipItem key={i} text={tip} />)}
          </div>
        </>
      ) : null}
    </div>
  );
};
