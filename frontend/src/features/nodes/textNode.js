import { useState, useEffect, useRef, useCallback } from 'react';
import { Position } from 'reactflow';
import { BaseNode, HandleWithTooltip } from './BaseNode';
import { useStore } from '../../app/store';

const VARIABLE_REGEX = /\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}\}/g;
const COLOR      = '#EC4899';
const MIN_WIDTH  = 220;
const MIN_HEIGHT = 90;

function extractVariables(text) {
  const seen = new Set();
  const vars = [];
  let match;
  VARIABLE_REGEX.lastIndex = 0;
  while ((match = VARIABLE_REGEX.exec(text)) !== null) {
    if (!seen.has(match[1])) { seen.add(match[1]); vars.push(match[1]); }
  }
  return vars;
}

export const TextNode = ({ id, data }) => {
  // local state updates immediately
  const [currText, setCurrText]   = useState(data?.text ?? '{{input}}');
  const [variables, setVariables] = useState(() => extractVariables(data?.text ?? '{{input}}'));
  const [nodeWidth, setNodeWidth] = useState(MIN_WIDTH);
  const textareaRef  = useRef(null);
  const debounceRef  = useRef(null);
  const updateNodeField = useStore((s) => s.updateNodeField);

  // sync with external node data
  useEffect(() => {
    if (data.text !== undefined && data.text !== currText) {
      setCurrText(data.text);
      setVariables(extractVariables(data.text));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.text]);

  const handleChange = useCallback(
    (e) => {
      const val = e.target.value;
      setCurrText(val);
      setVariables(extractVariables(val));

      // resize textarea
      const lines       = val.split('\n');
      const longestLine = Math.max(...lines.map((l) => l.length), 12);
      setNodeWidth(Math.max(MIN_WIDTH, longestLine * 7.5 + 48));
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      }

      // debounce store writes
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        updateNodeField(id, 'text', val);
      }, 300);
    },
    [id, updateNodeField]
  );

  // clear pending updates on unmount
  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const textareaHeight = textareaRef.current ? textareaRef.current.scrollHeight : 36;
  const nodeHeight     = Math.max(MIN_HEIGHT, 52 + textareaHeight);

  return (
    <div className="relative">
      <BaseNode id={id} title="Text" handles={[]} width={nodeWidth} height={nodeHeight} accentColor={COLOR}>
        <textarea
          ref={textareaRef}
          className="node-textarea w-full min-h-[36px]"
          value={currText}
          onChange={handleChange}
          rows={1}
        />
      </BaseNode>

      <HandleWithTooltip
        type="source"
        position={Position.Right}
        id={`${id}-output`}
        accentColor={COLOR}
        label="OUT · output"
        size={10}
        style={{
          boxShadow: `0 0 0 1px ${COLOR}`,
          top: '50%',
        }}
      />

      {variables.map((varName, index) => {
        const topPct = ((index + 1) / (variables.length + 1)) * 100;
        return (
          <div
            key={varName}
            className="absolute left-0 flex items-center"
            style={{ top: `${topPct}%`, transform: 'translateY(-50%)' }}
          >
            <HandleWithTooltip
              type="target"
              position={Position.Left}
              id={`${id}-${varName}`}
              accentColor={COLOR}
              label={`IN · ${varName}`}
              size={10}
              style={{
                boxShadow: `0 0 0 1px ${COLOR}`,
                position: 'relative',
                transform: 'none',
                top: 'auto',
                left: 'auto',
              }}
            />
            <span className="absolute left-[14px] text-[10px] text-node-muted bg-node-bg border border-node-border px-1 rounded-[3px] pointer-events-none font-mono whitespace-nowrap">
              {varName}
            </span>
          </div>
        );
      })}
    </div>
  );
};
