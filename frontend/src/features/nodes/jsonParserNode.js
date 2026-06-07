import { Position } from 'reactflow';
import { BaseNode }  from './BaseNode';
import { useStore }  from '../../app/store';

export const JsonParserNode = ({ id, data }) => {
  const updateNodeField = useStore((s) => s.updateNodeField);

  const handles = [
    { id: `${id}-json`,   type: 'target', position: Position.Left },
    { id: `${id}-parsed`, type: 'source', position: Position.Right },
  ];

  return (
    <BaseNode id={id} title="JSON Parser" handles={handles} accentColor="#8B5CF6">
      <div className="node-field">
        <label className="node-label">Key</label>
        <input
          className="node-input"
          type="text"
          placeholder="e.g. data.user.name"
          value={data.jsonPath ?? ''}
          onChange={(e) => updateNodeField(id, 'jsonPath', e.target.value)}
        />
      </div>
      <span className="text-[9px] text-node-muted font-mono tracking-[0.06em]">dot-notation path</span>
    </BaseNode>
  );
};
