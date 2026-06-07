import { useState, useEffect, useCallback, useRef } from 'react';
import { useStore } from '../../app/store';

const ToolBtn = ({ icon, label, shortcut, active, disabled, onClick, tour }) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      data-tour={tour}
      title={`${label}${shortcut ? `  (${shortcut})` : ''}`}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="relative w-10 h-10 flex items-center justify-center border-none transition-all duration-100 select-none"
      style={{
        background: active ? 'var(--surface)' : hov ? 'var(--ctrl-hover)' : 'transparent',
        borderRadius: 6,
        color: active ? 'var(--ink)' : disabled ? 'var(--dim)' : hov ? 'var(--ctrl-ink)' : 'var(--ctrl-muted)',
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'default' : 'pointer',
      }}
    >
      {icon}
      {shortcut && (
        <span
          className="absolute bottom-[3px] right-[4px] font-mono leading-none"
          style={{ fontSize: '7px', color: active ? 'var(--muted)' : 'var(--dim)', letterSpacing: 0 }}
        >
          {shortcut}
        </span>
      )}
    </button>
  );
};

const Divider = () => (
  <div className="mx-2 my-[2px]" style={{ height: 1, background: 'var(--ctrl-border)' }} />
);

const CursorIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M3 2l9 9-4.5.5L5 15l-1.5-3.5L2 13z" fillRule="evenodd" />
  </svg>
);
const GrabIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 2v4M6 3.5v4M4 5v3M10 3.5v4M12 5v5.5a4 4 0 01-4 4h0a4 4 0 01-4-4V8" />
  </svg>
);
const SelectBoxIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="2.5" width="11" height="11" rx="1.5" strokeDasharray="3 2" />
    <path d="M9.5 9.5l4 4" />
  </svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M8 3v10M3 8h10" />
  </svg>
);
const DeleteIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 4h10M6 4V2.5h4V4M5 4l.5 9.5h5L11 4" />
  </svg>
);
const FitIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 2H3a1 1 0 00-1 1v2M11 2h2a1 1 0 011 1v2M5 14H3a1 1 0 01-1-1v-2M11 14h2a1 1 0 001-1v-2" />
    <rect x="5" y="5" width="6" height="6" rx="1" />
  </svg>
);
const UndoIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7H10a3 3 0 010 6H7" />
    <path d="M3 7l3-3M3 7l3 3" />
  </svg>
);
const RedoIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 7H6a3 3 0 000 6h3" />
    <path d="M13 7l-3-3M13 7l-3 3" />
  </svg>
);

const inInput = () => {
  const el = document.activeElement;
  const tag = el?.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el?.isContentEditable;
};

export const FloatingToolbar = () => {
  const tool = useStore((s) => s.tool);
  const setTool = useStore((s) => s.setTool);
  const panelOpen = useStore((s) => s.panelOpen);
  const setPanelOpen = useStore((s) => s.setPanelOpen);
  const selectedNodes = useStore((s) => s.selectedNodes);
  const history = useStore((s) => s.history);
  const future = useStore((s) => s.future);
  const deleteSelectedNodes = useStore((s) => s.deleteSelectedNodes);
  const duplicateSelected = useStore((s) => s.duplicateSelected);
  const selectAll = useStore((s) => s.selectAll);
  const deselectAll = useStore((s) => s.deselectAll);
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);
  const reactFlowInstance = useStore((s) => s.reactFlowInstance);
  const spaceToolRef = useRef(null);

  const hasSelection = selectedNodes.length > 0;
  const canUndo = history.length > 0;
  const canRedo = future.length > 0;

  const handleFitView = useCallback(() => {
    reactFlowInstance?.fitView({ duration: 300, padding: 0.14 });
  }, [reactFlowInstance]);

  const handleFitSelection = useCallback(() => {
    if (selectedNodes.length) {
      reactFlowInstance?.fitView({
        nodes: selectedNodes.map((node) => ({ id: node.id })),
        duration: 300,
        padding: 0.2,
      });
    }
  }, [reactFlowInstance, selectedNodes]);

  const handleZoom100 = useCallback(() => {
    reactFlowInstance?.zoomTo?.(1, { duration: 250 });
  }, [reactFlowInstance]);

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      const ctrl = e.ctrlKey || e.metaKey;

      // shortcuts that should work inside inputs
      if (ctrl) {
        if (e.key === 'z' || e.key === 'Z') {
          e.preventDefault();
          if (e.shiftKey) redo(); else undo();
          return;
        }
        if (e.key === 'y' || e.key === 'Y') { e.preventDefault(); redo(); return; }
        if (e.key === 's' || e.key === 'S') {
          e.preventDefault();
          // save the current pipeline
          const { nodes, edges } = useStore.getState();
          try { localStorage.setItem('vs-pipeline-v1', JSON.stringify({ nodes, edges })); } catch { }
          return;
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          // run the current pipeline
          window.dispatchEvent(new CustomEvent('vs:run-pipeline'));
          return;
        }
        if (e.key === '0') {
          e.preventDefault();
          handleZoom100();
          return;
        }
      }

      if (inInput()) return;

      if (e.shiftKey && e.key === '1') {
        e.preventDefault();
        handleFitView();
        return;
      }

      if (e.shiftKey && e.key === '2') {
        e.preventDefault();
        handleFitSelection();
        return;
      }

      if (ctrl) {
        if (e.key === 'a' || e.key === 'A') { e.preventDefault(); selectAll(); return; }
        if (e.key === 'd' || e.key === 'D') { e.preventDefault(); duplicateSelected(); return; }
      }

      switch (e.key) {
        case 'v': case 'V': setTool('select'); break;
        case 'h': case 'H': setTool('grab'); break;
        case 'm': case 'M': setTool('multiselect'); break;
        case 'f': case 'F': handleFitView(); break;
        case ' ':
          e.preventDefault();
          if (!e.repeat && tool !== 'grab' && spaceToolRef.current === null) {
            spaceToolRef.current = tool;
          }
          setTool('grab');
          break;
        case 'Escape':
          // close the panel before clearing selection
          if (panelOpen) { setPanelOpen(false); }
          else if (hasSelection) { deselectAll(); }
          break;
        case 'Delete':
        case 'Backspace':
          if (hasSelection) deleteSelectedNodes();
          break;
        default: break;
      }
    };

    const onKeyUp = (e) => {
      if (e.key !== ' ' || spaceToolRef.current === null) return;
      e.preventDefault();
      setTool(spaceToolRef.current);
      spaceToolRef.current = null;
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [
    setTool, tool, panelOpen, setPanelOpen, hasSelection,
    deleteSelectedNodes, duplicateSelected, selectAll, deselectAll,
    undo, redo, handleFitView, handleFitSelection, handleZoom100,
  ]);

  return (
    <div
      className="absolute z-40 flex flex-col items-center"
      style={{
        left: 12,
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'var(--ctrl-bg)',
        border: '1px solid var(--ctrl-border)',
        borderRadius: 12,
        boxShadow: '0 4px 24px rgba(15,19,26,0.12)',
        padding: '4px',
        width: 48,
      }}
    >
      <ToolBtn icon={<PlusIcon />} label="Add nodes" active={panelOpen} onClick={() => setPanelOpen(!panelOpen)} tour="add-nodes" />

      <Divider />

      <ToolBtn icon={<CursorIcon />} label="Select" shortcut="V" active={tool === 'select'} onClick={() => setTool('select')} />
      <ToolBtn icon={<SelectBoxIcon />} label="Box select" shortcut="M" active={tool === 'multiselect'} onClick={() => setTool('multiselect')} />
      <ToolBtn icon={<GrabIcon />} label="Grab / Pan" shortcut="H" active={tool === 'grab'} onClick={() => setTool('grab')} />

      <Divider />

      <ToolBtn icon={<FitIcon />} label="Fit view" shortcut="F" onClick={handleFitView} />
      <ToolBtn icon={<UndoIcon />} label="Undo" shortcut="CmdZ" disabled={!canUndo} onClick={undo} />
      <ToolBtn icon={<RedoIcon />} label="Redo" shortcut="CmdShiftZ" disabled={!canRedo} onClick={redo} />
      <ToolBtn icon={<DeleteIcon />} label="Delete selected" shortcut="Del" disabled={!hasSelection} onClick={deleteSelectedNodes} />
    </div>
  );
};
