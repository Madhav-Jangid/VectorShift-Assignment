import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';

const COLOR = '#6366F1';

const HEADER_H = 22;
const PAD_TOP = 9;
const ROW_H = 22;
const GAP = 6;
const NODE_H = 128;

const rowCenter = (i) => HEADER_H + PAD_TOP + i * (ROW_H + GAP) + ROW_H / 2;
const SYSTEM_TOP = `${((rowCenter(1) / NODE_H) * 100).toFixed(1)}%`;
const PROMPT_TOP = `${((rowCenter(2) / NODE_H) * 100).toFixed(1)}%`;

export const LLMNode = ({ id }) => {
  const handles = [
    { id: `${id}-system`, type: 'target', position: Position.Left, style: { top: SYSTEM_TOP } },
    { id: `${id}-prompt`, type: 'target', position: Position.Left, style: { top: PROMPT_TOP } },
    { id: `${id}-response`, type: 'source', position: Position.Right },
  ];

  return (
    <BaseNode id={id} title="LLM" handles={handles} accentColor={COLOR} height={NODE_H}>
      <div className="node-field">
        <label className="node-label">Model</label>
        <button
          className="node-select"
          type="button"
          disabled
          title="Model selection is coming soon"
          style={{ opacity: 0.72, cursor: 'not-allowed', textAlign: 'left' }}
        >
          Hugging Face default
        </button>
      </div>
      <PortRow label="system" color={COLOR} rowH={ROW_H} />
      <PortRow label="prompt" color={COLOR} rowH={ROW_H} />
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
