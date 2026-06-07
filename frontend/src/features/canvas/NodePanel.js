import { useState, useCallback } from 'react';
import { useStore } from '../../app/store';
import { shallow }  from 'zustand/shallow';

const CATEGORIES = [
  {
    label: 'Input / Output',
    nodes: [
      {
        type: 'customInput',
        label: 'Input',
        description: 'Entry point -- receives pipeline data',
        accent: '#10B981',
        icon: (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        ),
      },
      {
        type: 'customOutput',
        label: 'Output',
        description: 'Collects and surfaces pipeline results',
        accent: '#F59E0B',
        icon: (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 8H3M7 4L3 8l4 4" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Intelligence',
    nodes: [
      {
        type: 'llm',
        label: 'LLM',
        description: 'Query any frontier language model',
        accent: '#6366F1',
        icon: (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="4" width="8" height="8" rx="1" />
            <path d="M6.5 1.5v2.5M9.5 1.5v2.5M6.5 12v2.5M9.5 12v2.5M1.5 6.5h2.5M1.5 9.5h2.5M12 6.5h2.5M12 9.5h2.5" />
          </svg>
        ),
      },
      {
        type: 'text',
        label: 'Text / Prompt',
        description: 'Static or templated prompt string',
        accent: '#EC4899',
        icon: (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3.5 4h9M8 4v8M5.5 12h5" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Logic',
    nodes: [
      {
        type: 'condition',
        label: 'Condition',
        description: 'Branch pipeline on a runtime boolean',
        accent: '#EF4444',
        icon: (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 2l5.5 6L8 14l-5.5-6z" />
          </svg>
        ),
      },
      {
        type: 'jsonParser',
        label: 'JSON Parser',
        description: 'Extract a field from a JSON payload',
        accent: '#8B5CF6',
        icon: (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5.5 3C4 3 3.5 3.6 3.5 5v1.5c0 .7-.5 1-1 1.5.5.5 1 .8 1 1.5V11c0 1.4.5 2 2 2" />
            <path d="M10.5 3C12 3 12.5 3.6 12.5 5v1.5c0 .7.5 1 1 1.5-.5.5-1 .8-1 1.5V11c0 1.4-.5 2-2 2" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Actions',
    nodes: [
      {
        type: 'api',
        label: 'API Call',
        description: 'HTTP request to any external endpoint',
        accent: '#0EA5E9',
        icon: (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.5 2.5l-5 6h4.5l-2.5 5 6.5-8H8.5l1-3z" />
          </svg>
        ),
      },
      {
        type: 'email',
        label: 'Email',
        description: 'Send an email notification',
        accent: '#06B6D4',
        icon: (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="12" height="9" rx="1.5" />
            <path d="M2 5.5l6 4.5 6-4.5" />
          </svg>
        ),
      },
      {
        type: 'delay',
        label: 'Delay',
        description: 'Pause execution for a set duration',
        accent: '#F97316',
        icon: (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="8.5" r="5.5" />
            <path d="M8 6v2.5l2 2" />
          </svg>
        ),
      },
    ],
  },
];

const GripIcon = () => (
  <svg width="8" height="12" viewBox="0 0 8 12" fill="currentColor">
    <circle cx="2" cy="2"  r="1.3" />
    <circle cx="6" cy="2"  r="1.3" />
    <circle cx="2" cy="6"  r="1.3" />
    <circle cx="6" cy="6"  r="1.3" />
    <circle cx="2" cy="10" r="1.3" />
    <circle cx="6" cy="10" r="1.3" />
  </svg>
);

const NodeItem = ({ node, onDragStart, onClick }) => {
  const [hov, setHov] = useState(false);
  const [gripHov, setGripHov] = useState(false);

  return (
    <div
      className="flex items-center gap-[6px] transition-colors duration-100 select-none"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? 'var(--ctrl-hover)' : 'transparent',
        borderRadius: 7,
        padding: '1px 2px 1px 6px',
      }}
    >
      <div
        className="flex items-center justify-center shrink-0 rounded-[5px] transition-all duration-150"
        style={{
          width: 28,
          height: 28,
          background: hov ? node.accent + '1A' : 'var(--surface)',
          color: hov ? node.accent : 'var(--ctrl-muted)',
        }}
      >
        {node.icon}
      </div>

      <div
        className="flex-1 min-w-0 py-[7px] cursor-pointer"
        onClick={() => onClick(node.type)}
      >
        <div
          className="font-sans font-medium truncate leading-[1.2]"
          style={{ fontSize: '13px', color: 'var(--ctrl-ink)', letterSpacing: '-0.01em' }}
        >
          {node.label}
        </div>
        <div
          className="font-sans leading-[1.3] truncate"
          style={{ fontSize: '11px', color: 'var(--ctrl-muted)', marginTop: 1 }}
        >
          {node.description}
        </div>
      </div>

      <div
        draggable
        onDragStart={(e) => onDragStart(e, node.type)}
        onMouseDown={() => {}}
        onMouseEnter={() => setGripHov(true)}
        onMouseLeave={() => setGripHov(false)}
        title="Drag to canvas"
        className="flex items-center justify-center shrink-0 rounded transition-colors duration-100"
        style={{
          width: 28,
          height: 36,
          cursor: 'grab',
          color: gripHov ? 'var(--ctrl-ink)' : 'var(--dim)',
          background: gripHov ? 'var(--surface-2)' : 'transparent',
        }}
      >
        <GripIcon />
      </div>
    </div>
  );
};

const CategorySection = ({ category, onDragStart, onClick, query }) => {
  const filtered = query
    ? category.nodes.filter(
        (n) =>
          n.label.toLowerCase().includes(query) ||
          n.description.toLowerCase().includes(query)
      )
    : category.nodes;

  if (filtered.length === 0) return null;

  return (
    <div>
      <div
        className="px-3 py-[6px] font-mono uppercase sticky top-0"
        style={{
          fontSize: '10px',
          fontWeight: 500,
          letterSpacing: '0.14em',
          color: 'var(--ctrl-muted)',
          background: 'var(--ctrl-bg)',
          borderBottom: '1px solid var(--ctrl-border)',
        }}
      >
        {category.label}
      </div>
      <div className="px-2 py-1 flex flex-col gap-[2px]">
        {filtered.map((n) => (
          <NodeItem key={n.type} node={n} onDragStart={onDragStart} onClick={onClick} />
        ))}
      </div>
    </div>
  );
};

const selector = (s) => ({
  getNodeID:         s.getNodeID,
  addNode:           s.addNode,
  reactFlowInstance: s.reactFlowInstance,
  panelOpen:         s.panelOpen,
  setPanelOpen:      s.setPanelOpen,
});

export const NodePanel = () => {
  const { getNodeID, addNode, reactFlowInstance, panelOpen, setPanelOpen } =
    useStore(selector, shallow);

  const [query, setQuery] = useState('');

  const onDragStart = useCallback((event, type) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ nodeType: type }));
    event.dataTransfer.effectAllowed = 'move';
    setPanelOpen(false);
  }, [setPanelOpen]);

  const onClickAdd = useCallback((type) => {
    let position = { x: 300 + Math.random() * 120, y: 200 + Math.random() * 120 };
    if (reactFlowInstance) {
      const el = document.querySelector('.react-flow');
      if (el) {
        const r = el.getBoundingClientRect();
        const p = reactFlowInstance.project({ x: r.width / 2, y: r.height / 2 });
        position = { x: p.x + (Math.random() - 0.5) * 80, y: p.y + (Math.random() - 0.5) * 80 };
      }
    }
    const nodeID = getNodeID(type);
    addNode({ id: nodeID, type, position, data: { id: nodeID, nodeType: type } });
    setPanelOpen(false);
  }, [reactFlowInstance, getNodeID, addNode, setPanelOpen]);

  const q = query.trim().toLowerCase();
  const anyMatch = CATEGORIES.some((c) =>
    c.nodes.some((n) =>
      n.label.toLowerCase().includes(q) || n.description.toLowerCase().includes(q)
    )
  );

  return (
    <>
      {panelOpen && (
        <div
          className="absolute inset-0 z-30"
          onClick={() => setPanelOpen(false)}
        />
      )}

      <div
        data-tour="node-panel"
        className="absolute z-40 flex flex-col overflow-hidden"
        style={{
          left: 0,
          top: '50%',
          width: 308,
          height: '62vh',
          maxHeight: 540,
          background: 'var(--ctrl-bg)',
          border: '1px solid var(--ctrl-border)',
          borderRadius: 12,
          boxShadow: panelOpen
            ? '6px 0 32px rgba(15,19,26,0.14), 0 4px 16px rgba(15,19,26,0.08)'
            : 'none',
          // slide beside the toolbar when open
          transform: panelOpen
            ? 'translate(68px, -50%)'
            : 'translate(calc(-100% - 24px), -50%)',
          transition: 'transform 0.22s cubic-bezier(.16,1,.3,1)',
          pointerEvents: panelOpen ? 'auto' : 'none',
        }}
      >
        <div
          className="px-3 pt-3 pb-2 shrink-0"
          style={{ borderBottom: '1px solid var(--ctrl-border)' }}
        >
          <div
            className="font-sans font-medium mb-[10px]"
            style={{ fontSize: '14px', color: 'var(--ctrl-ink)', letterSpacing: '-0.01em' }}
          >
            Nodes
          </div>

          <div className="relative">
            <svg
              className="absolute left-[9px] top-1/2 -translate-y-1/2 pointer-events-none"
              width="12" height="12" viewBox="0 0 16 16" fill="none"
              stroke="var(--ctrl-muted)" strokeWidth="1.6" strokeLinecap="round"
            >
              <circle cx="6.5" cy="6.5" r="4" />
              <path d="M11 11l3 3" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full font-sans pl-[28px] pr-3 py-[6px] outline-none transition-colors duration-100"
              style={{
                fontSize: '12px',
                background: 'var(--surface)',
                border: '1px solid var(--ctrl-border)',
                borderRadius: 7,
                color: 'var(--ctrl-ink)',
              }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          {CATEGORIES.map((cat) => (
            <CategorySection
              key={cat.label}
              category={cat}
              onDragStart={onDragStart}
              onClick={onClickAdd}
              query={q}
            />
          ))}

          {q && !anyMatch && (
            <div
              className="flex flex-col items-center justify-center py-10 gap-2"
              style={{ color: 'var(--ctrl-muted)' }}
            >
              <svg width="22" height="22" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="6.5" cy="6.5" r="4" />
                <path d="M11 11l3 3" />
              </svg>
              <span className="font-sans" style={{ fontSize: '12px' }}>
                No nodes match "{q}"
              </span>
            </div>
          )}
        </div>

        <div
          className="px-3 py-2 shrink-0 flex items-center gap-[6px]"
          style={{
            borderTop: '1px solid var(--ctrl-border)',
            background: 'var(--surface)',
            borderRadius: '0 0 12px 12px',
          }}
        >
          <svg width="8" height="12" viewBox="0 0 8 12" fill="var(--dim)">
            <circle cx="2" cy="2"  r="1.3" />
            <circle cx="6" cy="2"  r="1.3" />
            <circle cx="2" cy="6"  r="1.3" />
            <circle cx="6" cy="6"  r="1.3" />
            <circle cx="2" cy="10" r="1.3" />
            <circle cx="6" cy="10" r="1.3" />
          </svg>
          <span className="font-mono" style={{ fontSize: '10px', color: 'var(--dim)', letterSpacing: '0.06em' }}>
            Drag grip to place - Click to add
          </span>
        </div>
      </div>
    </>
  );
};
