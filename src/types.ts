export type BaseEvent = { id: string; timestamp: number; step: number; eventSource?: string; lineNumber?: number; isReverse?: boolean };

export type EventPayload =
  | { type: "ARRAY_COMPARE"; indices: [number, number] }
  | { type: "ARRAY_SWAP"; indices: [number, number]; values: [number, number] }
  | { type: "ARRAY_SET"; index: number; value: number; previousValue?: number }
  | { type: "ARRAY_INSERT"; index: number; value: number }
  | { type: "ARRAY_REMOVE"; index: number; value: number }
  | { type: "GRAPH_RELAX"; edgeId: string; weight: number }
  | { type: "GRAPH_NODE_HIGHLIGHT"; nodeId: string; distance?: number }
  | { type: "GRAPH_EDGE_HIGHLIGHT"; edgeId: string; accepted?: boolean }
  | { type: "GRAPH_NODE_MOVE"; nodeId: string; x: number; y: number }
  | { type: "TREE_ROTATE"; pivotId: string; direction: "LEFT" | "RIGHT" }
  | { type: "SYSTEM_LOG"; message: string; level: "INFO" | "WARN" | "ERROR" }
  | { type: "SYSTEM_PLAYBACK_STATE"; isPlaying: boolean; currentStep: number; totalSteps: number; speed: number; deltaTime?: number }
  | { type: "TRACE_LOADED"; metadata: TraceMetadata }
  | { type: "ANIMATION_FRAME"; deltaTime: number; speed: number };

export type VisualizationEvent = BaseEvent & EventPayload;

export type TraceMetadata = { timeComplexity: string; spaceComplexity: string; executionTimeMs: number; nodeCount: number; algorithmName: string; initialState?: number[]; initialGraph?: GraphInput };

// ─── Graph Domain Types ───────────────────────────────────────────────────────

/** A single node in the force-directed graph */
export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  vx: number; // velocity x (for physics)
  vy: number; // velocity y
}

/** A weighted directed/undirected edge */
export interface GraphEdge {
  id: string;
  from: string; // node id
  to: string;
  weight: number;
}

/** Input shape passed to graph plugins */
export interface GraphInput {
  nodes: GraphNode[];
  edges: GraphEdge[];
  startNodeId?: string; // for Dijkstra source
  isDirected?: boolean; // false for undirected algorithms like Kruskal, true by default
}

/** Snapshot of all node positions (emitted by GraphLayoutEngine per tick) */
export interface GraphState {
  nodes: GraphNode[];
  edges: GraphEdge[];
  highlightedEdges: Set<string>;  // edge ids currently lit up
}

export interface ArrayInput {
  values: number[];
}

export interface GridInput {
  width: number;
  height: number;
  walls: {x: number, y: number}[];
}

export interface MatrixInput {
  rows: number;
  cols: number;
  values: number[][];
}

export type VisualizationData = GraphInput | ArrayInput | GridInput | MatrixInput;

export interface ExecutionTrace { events: VisualizationEvent[]; metadata: TraceMetadata; }

/** Plugin Abstraction for deterministic algorithm generation */
export interface AlgorithmPlugin<InputShape = unknown> {
  id: string; // e.g., 'merge-sort'
  name: string; // e.g., 'Merge Sort'
  category: 'sorting' | 'graph' | 'tree' | 'dp';
  execute(data: InputShape): ExecutionTrace;
}

// ─── Worker Pool Contracts ────────────────────────────────────────────────────

/** Message sent FROM the main thread TO a worker */
export interface WorkerMessage {
  taskId: string;           // unique id to match request → response
  algorithmId: string;      // e.g. 'dijkstra' | 'kruskal'
  payload: GraphInput;      // serialised graph input
}

/** Response sent FROM a worker BACK to the main thread */
export type WorkerResponse =
  | { taskId: string; status: 'ok'; trace: ExecutionTrace }
  | { taskId: string; status: 'error'; message: string };
