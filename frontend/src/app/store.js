import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import { shallow } from 'zustand/shallow';

const STORAGE_KEY = 'vs-pipeline-v1';

const cloneGraph = ({ nodes = [], edges = [] }) => ({
  nodes: nodes.map((node) => ({
    ...node,
    position: { ...node.position },
    data: { ...node.data },
    selected: false,
  })),
  edges: edges.map((edge) => ({ ...edge, selected: false })),
});

const getNodeIDsFromNodes = (nodes = []) =>
  nodes.reduce((acc, node) => {
    const type = node.type;
    if (!type) return acc;

    const suffix = String(node.id || '').replace(`${type}-`, '');
    const numeric = Number.parseInt(suffix, 10);
    acc[type] = Math.max(acc[type] ?? 0, Number.isFinite(numeric) ? numeric : 0);
    return acc;
  }, {});

const persistGraph = ({ nodes, edges }) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges }));
  } catch {
    console.log('nnnn')
  }
};

const loadSaved = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saved = loadSaved();

export const useStore = create(
  subscribeWithSelector((set, get) => ({
    nodes: saved?.nodes ?? [],
    edges: saved?.edges ?? [],
    nodeIDs: {},
    reactFlowInstance: null,
    selectedNodes: [],
    fitViewRequest: 0,

    history: [],
    future: [],

    pushHistory: () =>
      set((s) => ({
        history: [...s.history.slice(-49), { nodes: s.nodes, edges: s.edges }],
        future: [],
      })),

    undo: () =>
      set((s) => {
        if (!s.history.length) return {};
        const prev = s.history[s.history.length - 1];
        return {
          nodes: prev.nodes,
          edges: prev.edges,
          selectedNodes: [],
          history: s.history.slice(0, -1),
          future: [{ nodes: s.nodes, edges: s.edges }, ...s.future.slice(0, 49)],
        };
      }),

    redo: () =>
      set((s) => {
        if (!s.future.length) return {};
        const next = s.future[0];
        return {
          nodes: next.nodes,
          edges: next.edges,
          selectedNodes: [],
          future: s.future.slice(1),
          history: [...s.history.slice(-49), { nodes: s.nodes, edges: s.edges }],
        };
      }),

    theme: 'light',
    screen: 'landing',
    tool: 'select',
    panelOpen: false,

    goToCanvas: () => set({ screen: 'canvas' }),
    goToLanding: () => set({ screen: 'landing' }),
    setTool: (tool) => set((s) => ({
      tool,
      selectedNodes: tool === 'grab' ? [] : s.selectedNodes,
      nodes: tool === 'grab' ? s.nodes.map((n) => ({ ...n, selected: false })) : s.nodes,
    })),
    setPanelOpen: (v) => set({ panelOpen: v }),
    toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
    requestFitView: () => set((s) => ({ fitViewRequest: s.fitViewRequest + 1 })),

    getNodeID: (type) => {
      const newIDs = { ...get().nodeIDs };
      if (newIDs[type] === undefined) newIDs[type] = 0;
      newIDs[type] += 1;
      set({ nodeIDs: newIDs });
      return `${type}-${newIDs[type]}`;
    },

    addNode: (node) => {
      get().pushHistory();
      set({ nodes: [...get().nodes, node] });
    },

    onNodesChange: (changes) =>
      set({ nodes: applyNodeChanges(changes, get().nodes) }),

    onEdgesChange: (changes) =>
      set({ edges: applyEdgeChanges(changes, get().edges) }),

    onConnect: (connection) => {
      get().pushHistory();
      set({
        edges: addEdge(
          {
            ...connection,
            type: 'flow',
            animated: false,
            style: { stroke: 'var(--edge-color)', strokeWidth: 2 },
          },
          get().edges
        ),
      });
    },

    deleteNode: (nodeId) => {
      get().pushHistory();
      set({
        nodes: get().nodes.filter((n) => n.id !== nodeId),
        edges: get().edges.filter(
          (e) => e.source !== nodeId && e.target !== nodeId
        ),
        selectedNodes: [],
      });
    },

    deleteSelectedNodes: () => {
      const ids = new Set(get().selectedNodes.map((n) => n.id));
      if (!ids.size) return;
      get().pushHistory();
      set({
        nodes: get().nodes.filter((n) => !ids.has(n.id)),
        edges: get().edges.filter(
          (e) => !ids.has(e.source) && !ids.has(e.target)
        ),
        selectedNodes: [],
      });
    },

    duplicateNode: (nodeId) => {
      const node = get().nodes.find((n) => n.id === nodeId);
      if (!node) return;
      get().pushHistory();
      const newId = get().getNodeID(node.type);
      set({
        nodes: [
          ...get().nodes,
          {
            ...node,
            id: newId,
            position: { x: node.position.x + 32, y: node.position.y + 32 },
            selected: false,
            data: { ...node.data, id: newId },
          },
        ],
      });
    },

    duplicateSelected: () => {
      const selected = get().selectedNodes;
      if (!selected.length) return;
      get().pushHistory();
      const newNodes = selected.map((n) => {
        const newId = get().getNodeID(n.type);
        return {
          ...n,
          id: newId,
          position: { x: n.position.x + 32, y: n.position.y + 32 },
          selected: false,
          data: { ...n.data, id: newId },
        };
      });
      set({ nodes: [...get().nodes, ...newNodes], selectedNodes: [] });
    },

    setSelectedNodes: (nodes) => set({ selectedNodes: nodes }),

    selectAll: () => {
      const all = get().nodes;
      set({
        nodes: all.map((n) => ({ ...n, selected: true })),
        selectedNodes: all,
      });
    },

    deselectAll: () => {
      set({
        nodes: get().nodes.map((n) => ({ ...n, selected: false })),
        selectedNodes: [],
      });
    },

    clearCanvas: () => {
      localStorage.removeItem(STORAGE_KEY);
      set({
        nodes: [],
        edges: [],
        nodeIDs: {},
        selectedNodes: [],
        history: [],
        future: [],
        tool: 'select',
        panelOpen: false,
      });
    },

    updateNodeField: (nodeId, fieldName, fieldValue) =>
      set({
        nodes: get().nodes.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, [fieldName]: fieldValue } }
            : node
        ),
      }),

    setReactFlowInstance: (instance) => set((s) => ({
      reactFlowInstance: instance,
      fitViewRequest: s.nodes.length ? s.fitViewRequest + 1 : s.fitViewRequest,
    })),

    toggleNodeLock: (nodeId) =>
      set({
        nodes: get().nodes.map((n) =>
          n.id === nodeId
            ? { ...n, draggable: n.draggable === false ? true : false }
            : n
        ),
      }),

    loadWorkflow: ({ nodes, edges }) => {
      const graph = cloneGraph({ nodes, edges });
      persistGraph(graph);
      set((s) => ({
        nodes: graph.nodes,
        edges: graph.edges,
        nodeIDs: getNodeIDsFromNodes(graph.nodes),
        selectedNodes: [],
        history: [{ nodes: s.nodes, edges: s.edges }],
        future: [],
        screen: 'canvas',
        panelOpen: false,
        tool: 'select',
        fitViewRequest: s.fitViewRequest + 1,
      }));
    },
  }))
);

useStore.subscribe(
  (s) => ({ nodes: s.nodes, edges: s.edges }),
  ({ nodes, edges }) => {
    persistGraph({ nodes, edges });
  },
  { equalityFn: shallow }
);
