import { useStore } from './store';
import { Canvas } from '../features/canvas/Canvas';
import { ContextToolbar } from '../features/canvas/ContextToolbar';
import { LandingScreen } from '../features/landing/LandingScreen';
import { FloatingToolbar } from '../features/canvas/FloatingToolbar';
import { NodePanel } from '../features/canvas/NodePanel';
import { FloatingControls } from '../features/canvas/FloatingControls';
import { NodePropertiesPanel } from '../features/canvas/NodePropertiesPanel';
import { ProductTour } from '../features/canvas/ProductTour';

const PANEL_WIDTH = 300;

function App() {
  const theme = useStore((s) => s.theme);
  const screen = useStore((s) => s.screen);
  const selectedNodes = useStore((s) => s.selectedNodes);

  if (screen === 'landing') return <LandingScreen />;

  const propsPanelOpen = selectedNodes.length === 1;

  return (
    <div
      data-theme={theme}
      className="w-screen h-screen overflow-hidden font-sans flex flex-row"
      style={{ background: 'var(--canvas-bg)' }}
    >
      <div className="flex-1 relative h-full min-w-0">
        <Canvas />
        <ContextToolbar />

        <FloatingControls />
        <FloatingToolbar />
        <NodePanel />
        <ProductTour />
      </div>

      <div
        data-tour={propsPanelOpen ? 'properties-panel' : undefined}
        style={{
          width: propsPanelOpen ? PANEL_WIDTH : 0,
          flexShrink: 0,
          overflow: 'hidden',
          transition: 'width 0.26s cubic-bezier(.16,1,.3,1)',
          borderLeft: `1px solid var(--ctrl-border)`,
          borderLeftWidth: propsPanelOpen ? 1 : 0,
          background: 'var(--ctrl-bg)',
        }}
      >
        <div style={{ width: PANEL_WIDTH, height: '100%' }}>
          <NodePropertiesPanel open={propsPanelOpen} />
        </div>
      </div>
    </div>
  );
}

export default App;
