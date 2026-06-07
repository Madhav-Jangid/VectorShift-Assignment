import { Position } from 'reactflow';
import { BaseNode }  from './BaseNode';
import { useStore }  from '../../app/store';

export const ApiNode = ({ id, data }) => {
  const updateNodeField = useStore((s) => s.updateNodeField);

  const handles = [
    { id: `${id}-body`,     type: 'target', position: Position.Left },
    { id: `${id}-response`, type: 'source', position: Position.Right },
  ];

  return (
    <BaseNode id={id} title="API Call" handles={handles} accentColor="#0EA5E9" height={100}>
      <div className="node-field">
        <label className="node-label">Method</label>
        <select
          className="node-select"
          value={data.method ?? 'GET'}
          onChange={(e) => updateNodeField(id, 'method', e.target.value)}
        >
          {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
      <div className="node-field">
        <label className="node-label">URL</label>
        <input
          className="node-input"
          type="text"
          placeholder="https://api.example.com"
          value={data.url ?? ''}
          onChange={(e) => updateNodeField(id, 'url', e.target.value)}
        />
      </div>
    </BaseNode>
  );
};
