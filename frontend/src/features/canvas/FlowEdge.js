import { getSmoothStepPath } from 'reactflow';

export const FlowEdge = ({
  id,
  sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  style = {},
  selected,
}) => {
  const [edgePath] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
    borderRadius: 8,
  });

  const baseStroke = style.stroke || 'var(--edge-color)';

  return (
    <g>
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={14}
        strokeLinecap="round"
        style={{ pointerEvents: 'stroke' }}
      />
      <path
        id={id}
        d={edgePath}
        fill="none"
        strokeLinecap="round"
        style={{
          stroke: selected ? 'var(--edge-color-hover)' : baseStroke,
          strokeWidth: selected ? 2.75 : 2,
          transition: 'stroke 0.12s ease, stroke-width 0.12s ease',
          pointerEvents: 'none',
        }}
      />
      {selected && (
        <path
          d={edgePath}
          fill="none"
          strokeLinecap="round"
          pathLength="100"
          style={{
            stroke: 'rgba(255,255,255,0.58)',
            strokeWidth: 1.25,
            strokeDasharray: '14 86',
            strokeDashoffset: 0,
            animation: 'edgeShine 1.8s linear infinite',
            pointerEvents: 'none',
          }}
        />
      )}
    </g>
  );
};
