import { Position } from 'reactflow';
import { BaseNode }  from './BaseNode';
import { useStore }  from '../../app/store';

const COLOR = '#06B6D4';

const HEADER_H = 22;
const PAD_TOP  = 9;
const ROW_H    = 22;
const GAP      = 6;
const NODE_H   = 116;

const rowCenter   = (i) => HEADER_H + PAD_TOP + i * (ROW_H + GAP) + ROW_H / 2;
const SUBJECT_TOP = `${((rowCenter(1) / NODE_H) * 100).toFixed(1)}%`;
const BODY_TOP    = `${((rowCenter(2) / NODE_H) * 100).toFixed(1)}%`;

export const EmailNode = ({ id, data }) => {
  const updateNodeField = useStore((s) => s.updateNodeField);

  const handles = [
    { id: `${id}-subject`, type: 'target', position: Position.Left,  style: { top: SUBJECT_TOP } },
    { id: `${id}-body`,    type: 'target', position: Position.Left,  style: { top: BODY_TOP } },
    { id: `${id}-sent`,    type: 'source', position: Position.Right },
  ];

  return (
    <BaseNode id={id} title="Email" handles={handles} accentColor={COLOR} height={NODE_H}>
      <div className="node-field">
        <label className="node-label">To</label>
        <input
          className="node-input"
          type="email"
          placeholder="recipient@example.com"
          value={data.to ?? ''}
          onChange={(e) => updateNodeField(id, 'to', e.target.value)}
        />
      </div>
      <PortRow label="subject" color={COLOR} rowH={ROW_H} />
      <PortRow label="body"    color={COLOR} rowH={ROW_H} />
    </BaseNode>
  );
};

const PortRow = ({ label, color, rowH }) => (
  <div className="flex items-center gap-[6px]" style={{ height: rowH }}>
    <span className="text-[9px] font-medium text-node-muted font-mono uppercase tracking-[0.08em] min-w-[36px] shrink-0">
      {label}
    </span>
    <div className="flex-1 h-px bg-node-border" />
    <div className="w-[5px] h-[5px] rounded-full opacity-35" style={{ background: color }} />
  </div>
);
