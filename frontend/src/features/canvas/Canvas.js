import { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, {
  Background, BackgroundVariant,
  MiniMap, Panel, useReactFlow, useViewport,
} from 'reactflow';
import { useStore } from '../../app/store';
import { shallow } from 'zustand/shallow';
import { SAMPLE_WORKFLOWS } from '../../data/workflows';
import { nodeTypes } from '../nodes';
import { FlowEdge } from './FlowEdge';

import 'reactflow/dist/style.css';

const proOptions = { hideAttribution: true };
const SNAP = 20;
const edgeTypes = { flow: FlowEdge };

const NODE_COLORS = {
  customInput: '#10B981', llm: '#6366F1', customOutput: '#F59E0B',
  text: '#EC4899', condition: '#EF4444', jsonParser: '#8B5CF6',
  email: '#06B6D4', delay: '#F97316', api: '#0EA5E9',
};

const EDGE_STYLE = { stroke: 'var(--edge-color)', strokeWidth: 2 };
const CONN_LINE_STYLE = { stroke: 'var(--accent)', strokeWidth: 1.5, strokeDasharray: '4 3' };

const selector = (s) => ({
  nodes: s.nodes,
  edges: s.edges,
  getNodeID: s.getNodeID,
  addNode: s.addNode,
  onNodesChange: s.onNodesChange,
  onEdgesChange: s.onEdgesChange,
  onConnect: s.onConnect,
  setReactFlowInstance: s.setReactFlowInstance,
  setSelectedNodes: s.setSelectedNodes,
  loadWorkflow: s.loadWorkflow,
  fitViewRequest: s.fitViewRequest,
  theme: s.theme,
  tool: s.tool,
});

const ZoomStepBtn = ({ icon, onClick }) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="w-8 h-8 flex items-center justify-center cursor-pointer border-none font-mono transition-colors duration-100"
      style={{
        background: hov ? 'var(--ctrl-hover)' : 'transparent',
        borderRadius: 6,
        color: hov ? 'var(--ctrl-ink)' : 'var(--ctrl-muted)',
        fontSize: 17,
        lineHeight: 1,
      }}
    >
      {icon}
    </button>
  );
};


const ZoomMenuItem = ({ label, shortcut, action }) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={action}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="w-full flex items-center justify-between cursor-pointer border-none font-sans transition-colors duration-100"
      style={{
        background: hov ? 'var(--ctrl-hover)' : 'transparent',
        padding: '7px 12px',
        fontSize: '13px',
        textAlign: 'left',
      }}
    >
      <span style={{ color: 'var(--ctrl-ink)', fontWeight: 400 }}>{label}</span>
      <span className="font-mono" style={{ fontSize: '11px', color: 'var(--ctrl-muted)' }}>{shortcut}</span>
    </button>
  );
};


const ZoomDropdown = () => {
  const { zoomIn, zoomOut, fitView, zoomTo } = useReactFlow();
  const { zoom } = useViewport();
  const setTool = useStore((s) => s.setTool);
  const [open, setOpen] = useState(false);
  const dropRef = useRef(null);

  const pct = Math.round(zoom * 100);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const items = [
    {
      label: 'Hand',
      shortcut: 'Space',
      action: () => { setTool('grab'); setOpen(false); },
    },
    {
      label: 'Zoom to fit',
      shortcut: 'Shift 1',
      action: () => { fitView({ duration: 280, padding: 0.14 }); setOpen(false); },
    },
    {
      label: 'Zoom to selection',
      shortcut: 'Shift 2',
      action: () => {
        const sel = useStore.getState().selectedNodes;
        if (sel.length) fitView({ nodes: sel, duration: 300, padding: 0.2 });
        setOpen(false);
      },
    },
    {
      label: 'Zoom to 100%',
      shortcut: 'Ctrl 0',
      action: () => { zoomTo(1, { duration: 250 }); setOpen(false); },
    },
  ];

  return (
    <Panel position="top-right" style={{ margin: '80px 12px 0 0', zIndex: 50 }}>
      <div data-tour="navigation" ref={dropRef} style={{ position: 'relative' }}>

        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-[6px] font-mono cursor-pointer border-none transition-colors duration-100"
          style={{
            fontSize: '12px',
            fontWeight: 500,
            background: 'var(--ctrl-bg)',
            border: '1px solid var(--ctrl-border)',
            borderRadius: open ? '6px 6px 0 0' : 6,
            borderBottom: open ? '1px solid transparent' : undefined,
            color: 'var(--ctrl-ink)',
            boxShadow: open ? 'none' : '0 2px 8px rgba(15,19,26,0.08)',
            padding: '5px 10px',
            letterSpacing: '0.01em',
            minWidth: 68,
            justifyContent: 'space-between',
          }}
        >
          <span>{pct}%</span>
          <svg
            width="10" height="6" viewBox="0 0 10 6" fill="none"
            style={{ transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'none' }}
          >
            <path d="M1 1l4 4 4-4" stroke="var(--ctrl-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {open && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              width: 220,
              background: 'var(--ctrl-bg)',
              border: '1px solid var(--ctrl-border)',
              borderTop: 'none',
              borderRadius: '0 0 8px 8px',
              boxShadow: '0 8px 24px rgba(15,19,26,0.14)',
              overflow: 'hidden',
              marginTop: 10,
            }}
          >
            <div
              className="flex items-center"
              style={{ borderBottom: '1px solid var(--ctrl-border)', padding: '4px 6px' }}
            >
              <ZoomStepBtn icon="-" onClick={() => zoomOut({ duration: 180 })} />
              <div
                className="flex-1 text-center font-mono"
                style={{ fontSize: '12px', fontWeight: 500, color: 'var(--ctrl-ink)' }}
              >
                {pct}%
              </div>
              <ZoomStepBtn icon="+" onClick={() => zoomIn({ duration: 180 })} />
            </div>

            <div className="py-1">
              {items.map((item) => (
                <ZoomMenuItem key={item.label} {...item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
};

const EmptyState = ({ onLoad }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-[5]">
    <div className="pointer-events-auto flex flex-col items-center gap-7 text-center px-6">
      <div>
        <div
          className="font-mono uppercase mb-3"
          style={{ fontSize: '11px', color: 'var(--dim)', letterSpacing: '0.18em' }}
        >
          VectorShift Pipeline Builder
        </div>
        <div
          className="font-sans leading-[1.3]"
          style={{ fontSize: '20px', fontWeight: 300, color: 'var(--muted)', letterSpacing: '-0.02em' }}
        >
          Click{' '}
          <span
            className="font-mono font-medium"
            style={{ fontSize: '14px', color: 'var(--accent)' }}
          >
            +
          </span>
          {' '}to add nodes,<br />or load a template below
        </div>
      </div>

      <div data-tour="templates" className="flex flex-wrap gap-3 justify-center">
        {SAMPLE_WORKFLOWS.map((wf) => (
          <EmptyTemplateCard key={wf.id} wf={wf} onLoad={() => onLoad(wf)} />
        ))}
      </div>
    </div>
  </div>
);

const EmptyTemplateCard = ({ wf, onLoad }) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onLoad}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="flex flex-col items-start gap-2 text-left cursor-pointer transition-all duration-150 border-none"
      style={{
        background: hov ? 'var(--ctrl-hover)' : 'var(--ctrl-bg)',
        border: `1px solid ${hov ? 'var(--border-2)' : 'var(--ctrl-border)'}`,
        borderRadius: 8,
        padding: '12px 16px',
        minWidth: 160,
      }}
    >
      <div className="flex items-center gap-[5px]">
        {wf.preview.map((n, i) => (
          <div key={i} className="flex items-center gap-[5px]">
            {i > 0 && <div className="w-3 h-px" style={{ background: 'var(--border-2)' }} />}
            <div className="w-[8px] h-[8px] rounded-full" style={{ background: n.color }} />
          </div>
        ))}
      </div>
      <div
        className="font-sans font-medium"
        style={{ fontSize: '12px', color: 'var(--ctrl-ink)', letterSpacing: '-0.01em' }}
      >
        {wf.name}
      </div>
      <div
        className="font-mono uppercase"
        style={{ fontSize: '9px', color: hov ? 'var(--accent)' : 'var(--ctrl-muted)', letterSpacing: '0.1em' }}
      >
        Load -&gt;
      </div>
    </button>
  );
};


export const Canvas = () => {
  const reactFlowWrapper = useRef(null);
  const initialFitDone = useRef(false);
  const lastFitRequest = useRef(-1);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const {
    nodes, edges,
    getNodeID, addNode,
    onNodesChange, onEdgesChange, onConnect,
    setReactFlowInstance, setSelectedNodes,
    loadWorkflow,
    fitViewRequest,
    theme, tool,
  } = useStore(selector, shallow);

  const isDark = theme === 'dark';
  const maskColor = isDark ? 'rgba(5,5,6,0.65)' : 'rgba(220,218,210,0.65)';

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const bounds = reactFlowWrapper.current.getBoundingClientRect();
    const raw = event?.dataTransfer?.getData('application/reactflow');
    if (!raw) return;
    const { nodeType: type } = JSON.parse(raw);
    if (!type) return;
    const rfi = useStore.getState().reactFlowInstance;
    const position = rfi
      ? rfi.project({ x: event.clientX - bounds.left, y: event.clientY - bounds.top })
      : { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    const nodeID = getNodeID(type);
    addNode({ id: nodeID, type, position, data: { id: nodeID, nodeType: type } });
  }, [getNodeID, addNode]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onSelectionChange = useCallback(({ nodes: sel }) => {
    setSelectedNodes(tool === 'grab' ? [] : sel);
  }, [setSelectedNodes, tool]);

  const handleLoadWorkflow = useCallback((wf) => {
    loadWorkflow({ nodes: wf.nodes, edges: wf.edges });
  }, [loadWorkflow]);

  const isEmpty = nodes.length === 0;

  useEffect(() => {
    const instance = useStore.getState().reactFlowInstance;
    if (!instance || !nodes.length) return;

    const shouldFitInitial = !initialFitDone.current;
    const shouldFitRequest = fitViewRequest !== lastFitRequest.current;
    if (!shouldFitInitial && !shouldFitRequest) return;

    initialFitDone.current = true;
    lastFitRequest.current = fitViewRequest;

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        instance.fitView({ padding: 0.18, duration: shouldFitInitial ? 0 : 420 });
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [fitViewRequest, nodes.length]);

  return (
    <div
      data-tour="canvas"
      ref={reactFlowWrapper}
      className={`absolute inset-0 vs-canvas-tool-${tool}${isGrabbing ? ' vs-canvas-grabbing' : ''}`}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={setReactFlowInstance}
        onSelectionChange={onSelectionChange}
        onMoveStart={() => setIsGrabbing(tool === 'grab')}
        onMoveEnd={() => setIsGrabbing(false)}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        proOptions={proOptions}
        snapGrid={[SNAP, SNAP]}
        connectionLineType="smoothstep"
        connectionLineStyle={CONN_LINE_STYLE}
        defaultEdgeOptions={{ type: 'flow', animated: false, style: EDGE_STYLE }}
        style={{ background: 'var(--canvas-bg)' }}
        panOnDrag={tool === 'grab'}
        nodesDraggable={tool !== 'grab'}
        nodesFocusable
        edgesFocusable
        elementsSelectable
        selectionOnDrag={tool === 'multiselect'}
        panOnScroll
        panOnScrollMode="free"
        zoomOnScroll
        zoomOnPinch
        selectionKeyCode={null}
        multiSelectionKeyCode="Shift"
      >
        <Background
          variant={BackgroundVariant.Dots}
          color={isDark ? 'rgba(255,255,255,0.25)' : '#FFFFFF'}
          gap={24}
          size={2.5}
        />
        <MiniMap
          style={{
            background: 'var(--ctrl-bg)',
            border: '1px solid var(--ctrl-border)',
            borderRadius: 8,
          }}
          nodeColor={(n) => NODE_COLORS[n.type] || 'var(--accent)'}
          maskColor={maskColor}
        />
        <ZoomDropdown />
      </ReactFlow>

      {isEmpty && <EmptyState onLoad={handleLoadWorkflow} />}
    </div>
  );
};
