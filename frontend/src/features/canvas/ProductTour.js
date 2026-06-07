import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Joyride, STATUS } from 'react-joyride';
import { useStore } from '../../app/store';

const STORAGE_KEY = 'vs-product-tour-seen-v1';

const hasCompletedTour = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
};

const completeTour = () => {
  try {
    localStorage.setItem(STORAGE_KEY, 'true');
  } catch { }
};

const isTargetAvailable = (step) => {
  if (step.placement === 'center') return true;
  return Boolean(document.querySelector(step.target));
};

const TourCopy = ({ eyebrow, title, body }) => (
  <div className="text-left">
    <div
      className="font-mono uppercase mb-2"
      style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--accent)' }}
    >
      {eyebrow}
    </div>
    <div
      className="font-sans mb-2"
      style={{ fontSize: 16, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.02em' }}
    >
      {title}
    </div>
    <div
      className="font-sans"
      style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--muted)' }}
    >
      {body}
    </div>
  </div>
);

export const ProductTour = () => {
  const setPanelOpen = useStore((s) => s.setPanelOpen);
  const [hasSeenTour, setHasSeenTour] = useState(hasCompletedTour);
  const [run, setRun] = useState(false);
  const [tourKey, setTourKey] = useState(0);
  const [activeSteps, setActiveSteps] = useState([]);
  const hasStartedRef = useRef(false);
  const startTimerRef = useRef(null);

  const allSteps = useMemo(() => {
    return [
      {
        target: '[data-tour="canvas"]',
        placement: 'center',
        skipBeacon: true,
        content: (
          <TourCopy
            eyebrow="Canvas"
            title="Build workflows visually"
            body="This is your pipeline canvas. Drop nodes here, connect their ports, and watch data move step by step through the workflow."
          />
        ),
      },
      {
        target: '[data-tour="add-nodes"]',
        content: (
          <TourCopy
            eyebrow="Nodes"
            title="Add building blocks"
            body="Open the node drawer to add inputs, prompts, LLM calls, APIs, conditions, delays, emails, and outputs."
          />
        ),
      },
      {
        target: '[data-tour="node-panel"]',
        content: (
          <TourCopy
            eyebrow="Library"
            title="Pick or drag a node"
            body="Click any node to place it near the center, or drag the grip to place it exactly where you want."
          />
        ),
      },
      {
        target: '[data-tour="node-handles"]',
        content: (
          <TourCopy
            eyebrow="Data Flow"
            title="Connect ports"
            body="Hover a connection point to see its label, then drag from output ports to input ports to pass data between nodes."
          />
        ),
      },
      {
        target: '[data-tour="validate"]',
        content: (
          <TourCopy
            eyebrow="Validate"
            title="Check the pipeline"
            body="Validate counts nodes and edges and confirms whether the workflow is a DAG before you execute it."
          />
        ),
      },
      {
        target: '[data-tour="execute"]',
        content: (
          <TourCopy
            eyebrow="Execute"
            title="Run the workflow"
            body="Execute runs the full pipeline with real port-level data flow, then shows final outputs and per-node execution results."
          />
        ),
      },
      {
        target: '[data-tour="navigation"]',
        content: (
          <TourCopy
            eyebrow="Navigation"
            title="Zoom and reframe"
            body="Use zoom controls, fit view, and the minimap area to move around larger workflows during a demo."
          />
        ),
      },
      {
        target: '[data-tour="templates"]',
        content: (
          <TourCopy
            eyebrow="Templates"
            title="Start with VectorShift"
            body="Load the VectorShift Diligence Copilot template to show every node working together in a finance-native workflow."
          />
        ),
      },
      {
        target: '[data-tour="canvas"]',
        placement: 'center',
        content: (
          <TourCopy
            eyebrow="Demo Ready"
            title="Run the VectorShift template"
            body="For your demo video, load the VectorShift template, validate it, then execute it to show the full trace."
          />
        ),
      },
    ];
  }, []);

  const getAvailableSteps = useCallback(() => allSteps.filter(isTargetAvailable), [allSteps]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === STORAGE_KEY && event.newValue === 'true') {
        setHasSeenTour(true);
        setRun(false);
        setActiveSteps([]);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    if (hasSeenTour || hasCompletedTour()) return undefined;
    if (hasStartedRef.current) return undefined;

    setPanelOpen(true);
    startTimerRef.current = window.setTimeout(() => {
      const steps = getAvailableSteps();
      if (steps.length) {
        hasStartedRef.current = true;
        setActiveSteps(steps);
        setTourKey((key) => key + 1);
        setRun(true);
      }
    }, 650);
    return () => {
      window.clearTimeout(startTimerRef.current);
      startTimerRef.current = null;
    };
  }, [getAvailableSteps, hasSeenTour, setPanelOpen]);

  useEffect(() => {
    if (!run) return;
    const timer = window.setTimeout(() => {
      setActiveSteps(getAvailableSteps());
    }, 120);
    return () => window.clearTimeout(timer);
  }, [getAvailableSteps, run]);

  const handleTourEvent = useCallback((data) => {
    const { status } = data;

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      completeTour();
      setHasSeenTour(true);
      setRun(false);
      setActiveSteps([]);
    }
  }, []);

  if (hasSeenTour && !run) return null;

  return (
    <Joyride
      key={tourKey}
      continuous
      onEvent={handleTourEvent}
      run={run}
      scrollToFirstStep
      steps={activeSteps}
      options={{
        buttons: ['back', 'close', 'primary', 'skip'],
        overlayClickAction: false,
        showProgress: true,
        skipBeacon: true,
      }}
      styles={{
        options: {
          arrowColor: 'var(--ctrl-bg)',
          backgroundColor: 'var(--ctrl-bg)',
          beaconSize: 28,
          overlayColor: 'rgba(10, 12, 16, 0.58)',
          primaryColor: 'var(--accent)',
          textColor: 'var(--ctrl-ink)',
          width: 360,
          zIndex: 2000,
        },
        tooltip: {
          border: '1px solid var(--ctrl-border)',
          borderRadius: 8,
          boxShadow: '0 28px 70px rgba(0,0,0,0.28)',
          fontFamily: 'inherit',
        },
        buttonBack: {
          color: 'var(--ctrl-muted)',
          fontFamily: 'monospace',
          fontSize: 11,
        },
        buttonNext: {
          borderRadius: 5,
          color: 'var(--accent-text)',
          fontFamily: 'monospace',
          fontSize: 11,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        },
        buttonSkip: {
          color: 'var(--ctrl-muted)',
          fontFamily: 'monospace',
          fontSize: 11,
        },
      }}
    />
  );
};
