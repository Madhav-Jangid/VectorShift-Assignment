import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../../app/store';
import { shallow } from 'zustand/shallow';
import { submitPipeline, executePipeline } from '../../services/pipelineApi';

const selector = (s) => ({ nodes: s.nodes, edges: s.edges });

const RunIcon = () => (
  <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
    <path d="M4 2.5l10 5.5-10 5.5z" />
  </svg>
);

const SpinIcon = ({ size = 10 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    style={{ animation: 'spin 0.75s linear infinite' }}
  >
    <path d="M8 2a6 6 0 1 1-3.9 1.5" />
  </svg>
);

const formatValue = (value) => {
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return value;
  return JSON.stringify(value, null, 2);
};

const statusColor = (status) => {
  if (status === 'success') return '#10B981';
  if (status === 'skipped') return '#F59E0B';
  return '#EF4444';
};

const JsonBlock = ({ value }) => (
  <pre
    className="text-[10px] font-mono p-2 rounded bg-node-bg overflow-x-auto whitespace-pre-wrap"
    style={{ color: 'var(--modal-ink)', maxHeight: 170 }}
  >
    {formatValue(value)}
  </pre>
);

const StatRow = ({ label, value, valueColor }) => (
  <div
    className="flex items-center justify-between px-[10px] py-[7px] rounded-[4px]"
    style={{ background: 'var(--modal-stat-bg)', border: '1px solid var(--modal-stat-border)' }}
  >
    <span className="text-[8px] font-medium font-mono uppercase tracking-[0.12em]" style={{ color: 'var(--modal-muted)' }}>
      {label}
    </span>
    <span
      className="text-xl font-semibold font-mono tracking-[-0.03em]"
      style={{ color: valueColor || 'var(--modal-ink)' }}
    >
      {value}
    </span>
  </div>
);

const ModalShell = ({ children, onClose, wide = false }) => {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 flex items-center justify-center z-[1000] font-sans"
      style={{ background: 'rgba(0,0,0,0.6)', animation: 'fadeIn 0.15s ease', backdropFilter: 'blur(4px)' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`rounded-lg px-8 pt-8 pb-6 min-w-[320px] ${wide ? 'max-w-[720px]' : 'max-w-[440px]'} w-[92%] max-h-[84vh] overflow-y-auto`}
        style={{
          background: 'var(--modal-bg)',
          border: '1px solid var(--modal-border)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.02)',
          animation: 'ctxSlideUp 0.18s ease',
        }}
      >
        {children}
        <div className="flex items-center justify-between gap-2 mt-5 border-t pt-4" style={{ borderColor: 'var(--modal-border)' }}>
          <span className="font-mono text-[9px]" style={{ color: 'var(--modal-muted)' }}>
            Press Esc to close
          </span>
          <button
            onClick={onClose}
            className="text-[9px] font-semibold font-mono uppercase tracking-[0.12em] rounded-[4px] py-[9px] px-5 border-none cursor-pointer transition-opacity duration-100"
            style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const ModalHeader = ({ title, color }) => (
  <div className="flex items-center justify-between mb-5">
    <span className="text-[9px] font-medium font-mono uppercase tracking-[0.14em]" style={{ color: 'var(--modal-muted)' }}>
      {title}
    </span>
    <div className="w-[6px] h-[6px] rounded-full" style={{ background: color }} />
  </div>
);

const ErrorBox = ({ children }) => (
  <div
    className="mb-5 px-[10px] py-3 rounded-[4px] text-[12px] leading-[1.55] font-mono"
    style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', color: '#F87171' }}
  >
    {children}
  </div>
);

const ResultModal = ({ result, error, onClose }) => (
  <ModalShell onClose={onClose}>
    <ModalHeader
      title={error ? 'Pipeline Error' : 'Pipeline Analysis'}
      color={error ? '#EF4444' : (result?.is_dag ? '#10B981' : '#F59E0B')}
    />

    {error ? (
      <ErrorBox>{error}</ErrorBox>
    ) : result ? (
      <>
        <div className="flex flex-col gap-[5px] mb-5">
          <StatRow label="Nodes" value={result.num_nodes} />
          <StatRow label="Edges" value={result.num_edges} />
          <StatRow label="Valid DAG" value={result.is_dag ? 'Yes' : 'No'} valueColor={result.is_dag ? '#10B981' : '#EF4444'} />
        </div>

        {!result.is_dag && (
          <div
            className="mb-[18px] px-[10px] py-2 rounded-[4px] text-[11px] leading-[1.55] font-sans"
            style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', color: '#F87171' }}
          >
            Pipeline contains a cycle or invalid edge and cannot execute as a DAG.
          </div>
        )}
      </>
    ) : null}
  </ModalShell>
);

const ExecutionResultsModal = ({ result, error, onClose }) => (
  <ModalShell onClose={onClose} wide>
    <ModalHeader
      title={error ? 'Execution Error' : 'Execution Results'}
      color={error ? '#EF4444' : statusColor(result?.status)}
    />

    {error ? (
      <ErrorBox>{error}</ErrorBox>
    ) : result ? (
      <>
        <div className="flex flex-col gap-[5px] mb-5">
          <StatRow label="Nodes" value={result.num_nodes} />
          <StatRow label="Edges" value={result.num_edges} />
          <StatRow label="Status" value={result.status === 'success' ? 'Success' : 'Error'} valueColor={statusColor(result.status)} />
        </div>

        <div className="mb-5 border-t pt-5" style={{ borderColor: 'var(--modal-border)' }}>
          <div className="text-[8px] font-medium uppercase mb-3" style={{ color: 'var(--modal-muted)' }}>
            Final Outputs
          </div>
          <JsonBlock value={result.outputs || {}} />
        </div>

        {Array.isArray(result.errors) && result.errors.length > 0 && (
          <div className="mb-5 border-t pt-5" style={{ borderColor: 'var(--modal-border)' }}>
            <div className="text-[8px] font-medium uppercase mb-3" style={{ color: 'var(--modal-muted)' }}>
              Errors
            </div>
            <div className="space-y-2">
              {result.errors.map((item, index) => (
                <div
                  key={`${item.node_id || 'error'}-${index}`}
                  className="px-[10px] py-2 rounded-[4px] text-[10px] leading-[1.55] font-mono"
                  style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', color: '#F87171' }}
                >
                  {item.node_id ? `${item.node_id}: ` : ''}{item.error || item}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-5 border-t pt-5" style={{ borderColor: 'var(--modal-border)' }}>
          <div className="text-[8px] font-medium uppercase mb-3" style={{ color: 'var(--modal-muted)' }}>
            Node Execution Results
          </div>

          <div className="space-y-3 max-h-[430px] overflow-y-auto">
            {result.execution_order && result.execution_order.map((nodeId, index) => {
              const nodeResult = result.node_results?.[nodeId];
              if (!nodeResult) return null;

              return (
                <div key={nodeId} className="p-3 rounded-[4px] border" style={{ background: 'var(--modal-stat-bg)', borderColor: 'var(--modal-stat-border)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[9px] font-mono font-semibold uppercase">{nodeId}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-mono uppercase" style={{ color: statusColor(nodeResult.status) }}>{nodeResult.status}</span>
                      <span className="text-[8px]" style={{ color: 'var(--modal-muted)' }}>Step {index + 1}</span>
                    </div>
                  </div>

                  {nodeResult.error && (
                    <div className="text-[10px] text-red-500 font-mono mb-2">{nodeResult.error}</div>
                  )}

                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <div className="text-[8px] font-mono uppercase mb-1" style={{ color: 'var(--modal-muted)' }}>Inputs</div>
                      <JsonBlock value={nodeResult.inputs || {}} />
                    </div>
                    <div>
                      <div className="text-[8px] font-mono uppercase mb-1" style={{ color: 'var(--modal-muted)' }}>Outputs</div>
                      <JsonBlock value={nodeResult.outputs || {}} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </>
    ) : null}
  </ModalShell>
);

export const RunButton = ({ compact = false }) => {
  const { nodes, edges } = useStore(selector, shallow);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('validate');

  const runPipeline = useCallback(async (runMode) => {
    if (loading) return;
    setLoading(true);
    setResult(null);
    setError(null);
    setMode(runMode);

    try {
      const analysis = runMode === 'validate'
        ? await submitPipeline(nodes, edges)
        : await executePipeline(nodes, edges);

      if (runMode === 'validate') {
        window.alert(
          `Pipeline Analysis\n\n` +
          `Nodes: ${analysis.num_nodes}\n` +
          `Edges: ${analysis.num_edges}\n` +
          `Valid DAG: ${analysis.is_dag ? 'Yes' : 'No'}`
        );
      }
      setResult(analysis);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [loading, nodes, edges]);

  const handleValidate = useCallback(() => runPipeline('validate'), [runPipeline]);
  const handleExecute = useCallback(() => runPipeline('execute'), [runPipeline]);

  useEffect(() => {
    const handler = () => handleExecute();
    window.addEventListener('vs:run-pipeline', handler);
    return () => window.removeEventListener('vs:run-pipeline', handler);
  }, [handleExecute]);

  const closeModal = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  const solidStyle = {
    background: loading ? 'var(--surface)' : 'var(--accent)',
    color: loading ? 'var(--muted)' : 'var(--accent-text)',
    border: '1px solid transparent',
    cursor: loading ? 'not-allowed' : 'pointer',
  };

  const outlineStyle = {
    background: 'transparent',
    color: loading ? 'var(--muted)' : 'var(--ctrl-ink)',
    border: '1px solid var(--ctrl-border)',
    cursor: loading ? 'not-allowed' : 'pointer',
  };

  const hover = {
    onMouseEnter: (e) => { if (!loading) e.currentTarget.style.opacity = '0.85'; },
    onMouseLeave: (e) => { e.currentTarget.style.opacity = '1'; },
  };

  const base = 'flex items-center justify-center font-mono transition-opacity duration-[120ms] shrink-0';

  return (
    <>
      {compact ? (
        <div className="flex gap-1">
          <button
            data-tour="validate"
            onClick={handleValidate}
            disabled={loading}
            title="Validate Pipeline"
            className={`${base} w-[30px] h-[30px] rounded-[5px] text-[9px]`}
            style={outlineStyle}
            {...hover}
          >
            OK
          </button>
          <button
            data-tour="execute"
            onClick={handleExecute}
            disabled={loading}
            title="Execute Pipeline"
            className={`${base} w-[30px] h-[30px] rounded-[5px]`}
            style={solidStyle}
            {...hover}
          >
            {loading ? <SpinIcon /> : <RunIcon />}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 text-[8px] font-mono">
            <button
              data-tour="validate"
              onClick={handleValidate}
              disabled={loading}
              style={outlineStyle}
              className={`${base} text-nowrap flex-1 gap-[6px] rounded-[5px] px-[10px] py-2 text-[9px] font-semibold uppercase tracking-[0.12em]`}
              {...hover}
            >
              {loading && mode === 'validate' ? <SpinIcon /> : null}
              Validate Pipeline
            </button>
            <button
              data-tour="execute"
              onClick={handleExecute}
              disabled={loading}
              style={solidStyle}
              className={`${base} text-nowrap flex-1 gap-[7px] rounded-[5px] px-[10px] py-2 text-[9px] font-semibold uppercase tracking-[0.12em]`}
              {...hover}
            >
              {loading && mode === 'execute' ? <SpinIcon /> : <RunIcon />}
              Execute Pipeline
            </button>
          </div>
        </div >
      )}

      {
        mode === 'validate'
          ? (result || error) && <ResultModal result={result} error={error} onClose={closeModal} />
          : (result || error) && <ExecutionResultsModal result={result} error={error} onClose={closeModal} />
      }
    </>
  );
};
