import { Position } from 'reactflow';
import { BaseNode }  from './BaseNode';
import { useStore }  from '../../app/store';

export const DelayNode = ({ id, data }) => {
  const updateNodeField = useStore((s) => s.updateNodeField);

  const handles = [
    { id: `${id}-input`,  type: 'target', position: Position.Left },
    { id: `${id}-output`, type: 'source', position: Position.Right },
  ];

  return (
    <BaseNode id={id} title="Delay" handles={handles} accentColor="#F97316">
      <div className="node-field">
        <label className="node-label">Wait</label>
        <input
          className="node-input w-[60px] flex-none"
          type="number"
          min="0"
          value={data.duration ?? 1}
          onChange={(e) => updateNodeField(id, 'duration', Number(e.target.value))}
        />
        <select
          className="node-select flex-1"
          value={data.unit ?? 'Seconds'}
          onChange={(e) => updateNodeField(id, 'unit', e.target.value)}
        >
          <option value="Milliseconds">ms</option>
          <option value="Seconds">seconds</option>
          <option value="Minutes">minutes</option>
          <option value="Hours">hours</option>
        </select>
      </div>
    </BaseNode>
  );
};
