import { useState } from 'react';
import { useStore }  from '../../app/store';
import { RunButton } from './RunButton';

const SunIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="8" cy="8" r="3" />
    <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4" />
  </svg>
);
const MoonIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M13.5 10.5A6 6 0 0 1 5.5 2.5a6 6 0 1 0 8 8z" />
  </svg>
);
const BackIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 3L5 8l5 5" />
  </svg>
);
const NewFileIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 2H4a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V6L9 2z" />
    <path d="M9 2v4h4" />
    <path d="M8 9v4M6 11h4" />
  </svg>
);

const floatCard = {
  background:   'var(--ctrl-bg)',
  border:       '1px solid var(--ctrl-border)',
  borderRadius: 8,
  boxShadow:    '0 2px 12px rgba(15,19,26,0.08)',
};

const IconBtn = ({ title, onClick, children, danger }) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="w-8 h-8 flex items-center justify-center cursor-pointer border-none transition-colors duration-100"
      style={{
        background:   hov ? (danger ? 'rgba(239,68,68,0.08)' : 'var(--ctrl-hover)') : 'transparent',
        borderRadius: 6,
        color:        hov ? (danger ? '#EF4444' : 'var(--ctrl-ink)') : 'var(--ctrl-muted)',
      }}
    >
      {children}
    </button>
  );
};

const VDivider = () => (
  <div className="w-px h-4 mx-1 shrink-0" style={{ background: 'var(--ctrl-border)' }} />
);

export const FloatingControls = () => {
  const theme       = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const goToLanding = useStore((s) => s.goToLanding);
  const clearCanvas = useStore((s) => s.clearCanvas);
  const nodes       = useStore((s) => s.nodes);
  const edges       = useStore((s) => s.edges);

  const handleNew = () => {
    if (nodes.length === 0 || window.confirm('Clear the canvas and start a new pipeline?')) {
      clearCanvas();
    }
  };

  return (
    <>
      <div
        className="absolute top-3 left-3 z-40 flex items-center gap-1"
        style={{ ...floatCard, padding: '4px 6px' }}
      >
        <div className="flex items-center gap-2 px-2 py-[2px]" style={{ borderRight: '1px solid var(--ctrl-border)', marginRight: 2 }}>
          <div
            className="w-5 h-5 rounded-[4px] flex items-center justify-center font-mono font-bold shrink-0"
            style={{ background: 'var(--accent)', color: 'var(--accent-text)', fontSize: 7, letterSpacing: '0.04em' }}
          >
            VS
          </div>
          <span
            className="font-sans"
            style={{ fontSize: '12px', fontWeight: 500, color: 'var(--ctrl-ink)', letterSpacing: '-0.01em' }}
          >
            Pipeline Builder
          </span>
        </div>

        <IconBtn title="Back to home" onClick={goToLanding}>
          <BackIcon />
        </IconBtn>

        <IconBtn title="New pipeline  (clears canvas)" onClick={handleNew} danger>
          <NewFileIcon />
        </IconBtn>
      </div>

      <div
        className="absolute top-3 right-3 z-40 flex items-center"
        style={{ ...floatCard, padding: '4px 8px', gap: 4 }}
      >
        {nodes.length > 0 && (
          <>
            <div className="flex items-center gap-3 px-2">
              <span className="font-mono" style={{ fontSize: '11px', color: 'var(--ctrl-muted)' }}>
                <span style={{ color: 'var(--ctrl-ink)', fontWeight: 500 }}>{nodes.length}</span> nodes
              </span>
              <span className="font-mono" style={{ fontSize: '11px', color: 'var(--ctrl-muted)' }}>
                <span style={{ color: 'var(--ctrl-ink)', fontWeight: 500 }}>{edges.length}</span> edges
              </span>
            </div>
            <VDivider />
          </>
        )}

        <IconBtn title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'} onClick={toggleTheme}>
          <span data-tour="theme" className="flex items-center justify-center">
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </span>
        </IconBtn>

        <VDivider />

        <RunButton mini />
      </div>
    </>
  );
};
