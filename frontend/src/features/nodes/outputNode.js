import { Position } from 'reactflow';
import { BaseNode }  from './BaseNode';
import { useStore }  from '../../app/store';

const TYPES = ['Text', 'File', 'Number', 'Boolean', 'JSON'];

export const OutputNode = ({ id, data }) => {
  const updateNodeField = useStore((s) => s.updateNodeField);

  const handles = [
    { id: `${id}-value`, type: 'target', position: Position.Left },
  ];

  return (
    <BaseNode id={id} title="Output" handles={handles} accentColor="#F59E0B">
      <div className="node-field">
        <label className="node-label">Name</label>
        <input
          className="node-input"
          type="text"
          value={data.outputName ?? id.replace('customOutput-', 'output_')}
          onChange={(e) => updateNodeField(id, 'outputName', e.target.value)}
        />
      </div>
      <div className="node-field">
        <label className="node-label">Type</label>
        <select
          className="node-select"
          value={data.outputType ?? 'Text'}
          onChange={(e) => updateNodeField(id, 'outputType', e.target.value)}
        >
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
    </BaseNode>
  );
};
