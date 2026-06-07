import { Position } from 'reactflow';
import { BaseNode }  from './BaseNode';
import { useStore }  from '../../app/store';

export const ConditionNode = ({ id, data }) => {
  const updateNodeField = useStore((s) => s.updateNodeField);

  const trueTop = '38%';
  const falseTop = '62%';
  const handles = [
    { id: `${id}-value`, type: 'target', position: Position.Left,  style: { top: '40%' } },
    { id: `${id}-cond`,  type: 'target', position: Position.Left,  style: { top: '65%' } },
    { id: `${id}-true`,  type: 'source', position: Position.Right, style: { top: trueTop } },
    { id: `${id}-false`, type: 'source', position: Position.Right, style: { top: falseTop } },
  ];

  return (
    <div className="relative">
      <BaseNode id={id} title="Condition" handles={handles} accentColor="#EF4444" width={270} height={128}>
        <div className="node-field pr-16">
          <label className="node-label">Op</label>
          <select
            className="node-select"
            value={data.operator ?? 'equals'}
            onChange={(e) => updateNodeField(id, 'operator', e.target.value)}
          >
            <option value="equals">equals</option>
            <option value="not_equals">not equals</option>
            <option value="contains">contains</option>
            <option value="gt">greater than</option>
            <option value="lt">less than</option>
          </select>
        </div>
        <div className="node-field pr-16">
          <label className="node-label">Value</label>
          <input
            className="node-input"
            type="text"
            placeholder="compare to..."
            value={data.value ?? ''}
            onChange={(e) => updateNodeField(id, 'value', e.target.value)}
          />
        </div>
      </BaseNode>

      <BranchLabel top={trueTop} label="true" color="#22C55E" />
      <BranchLabel top={falseTop} label="false" color="#EF4444" />
    </div>
  );
};

const BranchLabel = ({ top, label, color }) => (
  <div
    className="absolute right-[16px] flex items-center gap-[4px] pointer-events-none"
    style={{ top, transform: 'translateY(-50%)' }}
  >
    <span
      className="text-[8px] font-mono font-semibold uppercase tracking-[0.05em] rounded-[3px] px-[4px] py-[1px] whitespace-nowrap"
      style={{
        color,
        background: 'var(--node-bg)',
        border: '1px solid var(--node-border)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}
    >
      {label}
    </span>
    <span className="h-px w-[8px]" style={{ background: color }} />
  </div>
);
