import { useState } from 'react';
import { useStore } from '../../app/store';
import { shallow }  from 'zustand/shallow';

const NODE_TYPE_LABELS = {
  customInput: 'Input', customOutput: 'Output', llm: 'LLM', text: 'Text',
  condition: 'Condition', jsonParser: 'JSON Parser', email: 'Email',
  delay: 'Delay', api: 'API Call',
};

const LockClosedIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="7" width="10" height="8" rx="1.5" />
    <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
  </svg>
);
const LockOpenIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="7" width="10" height="8" rx="1.5" />
    <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0" />
  </svg>
);
const CopyIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="5" width="8" height="8" rx="1.5" />
    <path d="M3 11V3h8" />
  </svg>
);
const FrameIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M1.5 5V2.5H4M12 2.5h2.5V5M14.5 11v2.5H12M4 13.5H1.5V11" />
  </svg>
);
const TrashIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 4.5h11M6 4.5V3h4v1.5M13.5 4.5l-1 9h-9l-1-9" />
  </svg>
);

const selector = (s) => ({
  selectedNodes:    s.selectedNodes,
  deleteNode:       s.deleteNode,
  deleteSelectedNodes: s.deleteSelectedNodes,
  duplicateNode:    s.duplicateNode,
  duplicateSelected: s.duplicateSelected,
  toggleNodeLock:   s.toggleNodeLock,
  reactFlowInstance: s.reactFlowInstance,
});

export const ContextToolbar = () => {
  const {
    selectedNodes, deleteNode, deleteSelectedNodes,
    duplicateNode, duplicateSelected,
    toggleNodeLock, reactFlowInstance,
  } = useStore(selector, shallow);

  if (!selectedNodes || selectedNodes.length === 0) return null;

  const count    = selectedNodes.length;
  const multi    = count > 1;
  const node     = selectedNodes[0];
  const isLocked = node.draggable === false;
  const typeName = NODE_TYPE_LABELS[node.type] || node.type;

  const handleFocus = () => {
    if (multi) {
      reactFlowInstance?.fitView({ nodes: selectedNodes.map((n) => ({ id: n.id })), duration: 350, padding: 0.3 });
    } else {
      reactFlowInstance?.fitView({ nodes: [{ id: node.id }], duration: 350, padding: 0.4 });
    }
  };

  return (
    <div
      data-tour="selection-actions"
      className="absolute bottom-[14px] left-0 right-0 flex justify-center pointer-events-none z-20 font-sans"
      style={{ animation: 'ctxSlideUp 0.15s ease' }}
    >
      <div className="flex items-center gap-[3px] rounded-[7px] px-[6px] py-1 pointer-events-auto"
           style={{
             background: 'var(--ctrl-bg)',
             border: '1px solid var(--ctrl-border)',
             boxShadow: '0 8px 32px rgba(15,19,26,0.14)',
           }}>

        <div
          className="px-[9px] py-[3px] rounded-[4px] text-[9px] font-medium font-mono uppercase tracking-[0.1em] whitespace-nowrap"
          style={{ background: 'var(--surface)', border: '1px solid var(--ctrl-border)', color: 'var(--ctrl-muted)' }}
        >
          {multi ? `${count} nodes` : typeName}
        </div>

        <div className="w-px h-4 mx-[2px] shrink-0" style={{ background: 'var(--ctrl-border)' }} />

        {!multi && (
          <TbBtn
            icon={isLocked ? <LockClosedIcon /> : <LockOpenIcon />}
            label={isLocked ? 'Locked' : 'Lock'}
            onClick={() => toggleNodeLock(node.id)}
          />
        )}

        <TbBtn
          icon={<CopyIcon />}
          label="Duplicate"
          onClick={multi ? duplicateSelected : () => duplicateNode(node.id)}
        />
        <TbBtn icon={<FrameIcon />} label="Focus" onClick={handleFocus} />

        <div className="w-px h-4 mx-[2px] shrink-0" style={{ background: 'var(--ctrl-border)' }} />

        <TbBtn
          icon={<TrashIcon />}
          label={multi ? `Delete ${count}` : 'Delete'}
          onClick={multi ? deleteSelectedNodes : () => deleteNode(node.id)}
          danger
        />
      </div>
    </div>
  );
};

const TbBtn = ({ icon, label, onClick, danger = false }) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="flex items-center gap-[5px] px-[7px] py-1 rounded-[4px] text-[11px] font-medium cursor-pointer font-sans whitespace-nowrap leading-none transition-all duration-100 border-none"
      style={{
        background: hov ? (danger ? 'rgba(239,68,68,0.08)' : 'var(--ctrl-hover)') : 'transparent',
        color: danger
          ? (hov ? '#EF4444' : 'var(--ctrl-muted)')
          : (hov ? 'var(--ctrl-ink)' : 'var(--ctrl-muted)'),
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};
