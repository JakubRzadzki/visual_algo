export type BaseEvent = {
  id: string;
  timestamp: number;
  step: number;
  eventSource?: string;
  lineNumber?: number;
  isReverse?: boolean;
};

export type EventPayload =
  | { type: "ARRAY_COMPARE"; indices: [number, number] }
  | { type: "ARRAY_SWAP"; indices: [number, number]; values: [number, number] }
  | { type: "ARRAY_SET"; index: number; value: number; previousValue?: number }
  | { type: "ARRAY_INSERT"; index: number; value: number }
  | { type: "ARRAY_REMOVE"; index: number; value: number }
  | { type: "GRAPH_NODE_ADD"; nodeId: string; label?: string }
  | {
      type: "GRAPH_EDGE_ADD";
      edgeId: string;
      from: string;
      to: string;
      weight?: number;
    }
  | { type: "GRAPH_EDGE_REMOVE"; edgeId: string }
  | { type: "GRAPH_RELAX"; edgeId: string; weight: number }
  | {
      type: "GRAPH_NODE_HIGHLIGHT";
      nodeId: string;
      distance?: number;
      status?: string;
    }
  | {
      type: "GRAPH_EDGE_HIGHLIGHT";
      edgeId: string;
      accepted?: boolean;
      status?: string;
    }
  | { type: "GRAPH_NODE_MOVE"; nodeId: string; x: number; y: number }
  | { type: "TREE_ROTATE"; pivotId: string; direction: "LEFT" | "RIGHT" }
  | {
      type: "MATRIX_CELL_UPDATE";
      row: number;
      col: number;
      value: number;
      dependencies?: [number, number][];
    }
  | { type: "MATRIX_CELL_HIGHLIGHT"; row: number; col: number; color?: string }
  | { type: "SEARCH_CHECK"; index: number; value: number; target: number }
  | { type: "SEARCH_FOUND"; index: number; value: number }
  | { type: "SEARCH_NOT_FOUND"; target: number }
  | { type: "SEARCH_NARROW"; left: number; right: number; mid: number }
  | { type: "VISIT"; nodeIds: string[] }
  | { type: "COMPARE"; nodeIds: string[] }
  | { type: "INSERT"; nodeIds: string[] }
  | {
      type: "KNAPSACK_FINAL_SELECTION";
      indices: number[];
      items: any[];
      totalValue: number;
      totalWeight: number;
    }
  | { type: "SYSTEM_LOG"; message: string; level: "INFO" | "WARN" | "ERROR" }
  | {
      type: "SYSTEM_PLAYBACK_STATE";
      isPlaying: boolean;
      currentStep: number;
      totalSteps: number;
      speed: number;
      deltaTime?: number;
    }
  | { type: "TRACE_LOADED"; metadata: TraceMetadata }
  | { type: "ANIMATION_FRAME"; deltaTime: number; speed: number };

export type VisualizationEvent = BaseEvent & EventPayload;

export type TraceMetadata = {
  timeComplexity: string;
  spaceComplexity: string;
  executionTimeMs: number;
  nodeCount: number;
  algorithmName: string;
  initialState?: number[];
  initialGraph?: GraphInput;
  rowHeaders?: string[];
  colHeaders?: string[];
  items?: any[];
  lcsResult?: string;
};

// ─── Graph Domain Types ───────────────────────────────────────────────────────

/** A single node in the force-directed graph */
export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  vx: number; // velocity x (for physics)
  vy: number; // velocity y
  hidden?: boolean; // initially hidden for dynamic tree building
}

/** A weighted directed/undirected edge */
export interface GraphEdge {
  id: string;
  from: string; // node id
  to: string;
  weight: number;
  hidden?: boolean; // initially hidden for dynamic tree building
}

/** Input shape passed to graph plugins */
export interface GraphInput {
  nodes: GraphNode[];
  edges: GraphEdge[];
  startNodeId?: string; // for Dijkstra source
  isDirected?: boolean; // false for undirected algorithms like Kruskal, true by default
  layoutHint?: "cose" | "dagre";
}

/** Snapshot of all node positions (emitted by GraphLayoutEngine per tick) */
export interface GraphState {
  nodes: GraphNode[];
  edges: GraphEdge[];
  highlightedEdges: Set<string>; // edge ids currently lit up
}

export interface ArrayInput {
  values: number[];
}

export interface GridInput {
  width: number;
  height: number;
  walls: { x: number; y: number }[];
  start?: { x: number; y: number };
  target?: { x: number; y: number };
}

export interface MatrixInput {
  rows: number;
  cols: number;
  values: number[][];
}

export interface KnapsackItem {
  weight: number;
  value: number;
}

export interface KnapsackInput {
  items: KnapsackItem[];
  capacity: number;
}

export interface LCSInput {
  text1: string;
  text2: string;
}

export type VisualizationData =
  | GraphInput
  | ArrayInput
  | GridInput
  | MatrixInput
  | KnapsackInput
  | LCSInput;

export interface ExecutionTrace {
  events: VisualizationEvent[];
  metadata: TraceMetadata;
}

/** Plugin Abstraction for deterministic algorithm generation */
export interface AlgorithmPlugin<InputShape = unknown> {
  id: string; // e.g., 'merge-sort'
  name: string; // e.g., 'Merge Sort'
  category: "sorting" | "searching" | "graph" | "tree" | "dp" | "grid";
  execute(data: InputShape): ExecutionTrace;
}

// ─── Worker Pool Contracts ────────────────────────────────────────────────────

/** Message sent FROM the main thread TO a worker */
export interface WorkerMessage {
  taskId: string; // unique id to match request → response
  algorithmId: string; // e.g. 'dijkstra' | 'kruskal'
  payload: VisualizationData; // serialized input data (GraphInput, ArrayInput, etc.)
}

/** Response sent FROM a worker BACK to the main thread */
export type WorkerResponse =
  | { taskId: string; status: "ok"; trace: ExecutionTrace }
  | { taskId: string; status: "error"; message: string };
