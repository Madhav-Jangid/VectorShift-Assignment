import { Position } from 'reactflow';
import { BaseNode }  from './BaseNode';
import { useStore }  from '../../app/store';

const TYPES = ['Text', 'File', 'Number', 'Boolean', 'JSON'];

export const InputNode = ({ id, data }) => {
  const updateNodeField = useStore((s) => s.updateNodeField);

  const handles = [
    { id: `${id}-value`, type: 'source', position: Position.Right },
  ];

  return (
    <BaseNode id={id} title="Input" handles={handles} accentColor="#10B981" height={126}>
      <div className="node-field">
        <label className="node-label">Name</label>
        <input
          className="node-input"
          type="text"
          value={data.inputName ?? id.replace('customInput-', 'input_')}
          onChange={(e) => updateNodeField(id, 'inputName', e.target.value)}
        />
      </div>
      <div className="node-field">
        <label className="node-label">Type</label>
        <select
          className="node-select"
          value={data.inputType ?? 'Text'}
          onChange={(e) => updateNodeField(id, 'inputType', e.target.value)}
        >
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div className="node-field">
        <label className="node-label">Default</label>
        <input
          className="node-input"
          type="text"
          placeholder="runtime value"
          value={data.defaultValue ?? ''}
          onChange={(e) => updateNodeField(id, 'defaultValue', e.target.value)}
        />
      </div>
    </BaseNode>
  );
};
