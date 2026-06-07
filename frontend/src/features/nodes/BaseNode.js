import { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { useStore } from '../../app/store';

const LockIcon = () => (
  <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="7.5" width="10" height="7" rx="1.5" />
    <path d="M5.5 7.5V5a2.5 2.5 0 0 1 5 0v2.5" />
  </svg>
);

const getPortName = (id = '') => id.split('-').slice(1).join('-') || id;

const getHandleLabel = ({ id, type, label }) => {
  if (label) return label;
  const direction = type === 'source' ? 'OUT' : 'IN';
  return `${direction} · ${getPortName(id)}`;
};

export const HandleWithTooltip = ({
  id,
  type,
  position,
  style,
  accentColor,
  label,
  size = 8,
  className,
}) => {
  const [hovered, setHovered] = useState(false);
  const isLeft = position === Position.Left;
  const top = style?.top && style.top !== 'auto' ? style.top : '50%';
  const tooltipLabel = getHandleLabel({ id, type, label });

  return (
    <>
      <Handle
        data-tour="node-handles"
        className={className}
        type={type}
        position={position}
        id={id}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: accentColor,
          border: '2px solid var(--node-bg)',
          width: size,
          height: size,
          borderRadius: '50%',
          ...style,
        }}
      />
      <div
        className="absolute z-[1000000] pointer-events-none rounded-[4px] border px-[6px] py-[3px] font-mono text-[9px] uppercase tracking-[0.08em] whitespace-nowrap transition-all duration-100"
        style={{
          top,
          [isLeft ? 'left' : 'right']: isLeft ? -8 : -8,
          transform: `translate(${isLeft ? '-100%' : '100%'}, -50%)`,
          opacity: hovered ? 1 : 0,
          color: 'var(--node-bg)',
          background: accentColor,
          borderColor: accentColor,
          boxShadow: '0 8px 18px rgba(0,0,0,0.18)',
        }}
      >
        {tooltipLabel}
      </div>
    </>
  );
};

export const BaseNode = ({
  id,
  title,
  handles = [],
  width = 220,
  height = 'auto',
  children,
  accentColor = '#E8703A',
}) => {
  const isLocked = useStore((s) => {
    if (!id) return false;
    const node = s.nodes.find((n) => n.id === id);
    return node?.draggable === false;
  });

  return (
    <div
      className="vs-node relative flex flex-col font-sans overflow-visible rounded-[5px] bg-node-bg border border-node-border"
      style={{
        '--nc': accentColor,
        width,
        minHeight: height === 'auto' ? 72 : undefined,
        height: height === 'auto' ? undefined : height,
        borderLeft: '3px solid var(--nc)',
        boxShadow: 'var(--node-shadow)',
      }}
    >
      <div className="flex items-center justify-between gap-[6px] px-[10px] pt-[5px] pb-1 shrink-0 bg-node-header border-b border-node-border rounded-[2px_3px_0_0]">
        <div className="flex items-center gap-[6px] min-w-0">
          <div
            className="w-[5px] h-[5px] rounded-full shrink-0 opacity-70"
            style={{ background: 'var(--nc)' }}
          />
          <span className="text-[9px] font-medium text-node-muted uppercase tracking-[0.12em] font-mono truncate">
            {title}
          </span>
        </div>
        {isLocked && (
          <div
            className="shrink-0 flex items-center justify-center rounded-[3px] px-[4px] py-[2px] gap-[3px]"
            style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
            title="Node is locked"
          >
            <LockIcon />
            <span className="text-[8px] font-mono font-medium uppercase tracking-[0.08em]" style={{ color: 'var(--accent)' }}>
              locked
            </span>
          </div>
        )}
      </div>

      <div className="px-[10px] py-[9px] flex-1 flex flex-col gap-[6px]">
        {children}
      </div>

      {handles.map((h) => (
        <HandleWithTooltip
          key={h.id}
          type={h.type}
          position={h.position}
          id={h.id}
          label={h.label}
          style={h.style}
          accentColor={accentColor}
        />
      ))}
    </div>
  );
};
export { Position } from 'reactflow';
