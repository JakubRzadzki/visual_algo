export type BaseEvent = { id: string; timestamp: number; step: number };

export type VisualizationEvent = BaseEvent & (
  | { type: "ARRAY_COMPARE"; indices: [number, number] }
  | { type: "ARRAY_SWAP"; indices: [number, number]; values: [number, number] }
  | { type: "ARRAY_SET"; index: number; value: number }
  | { type: "GRAPH_RELAX"; edgeId: string; weight: number }
  | { type: "TREE_ROTATE"; pivotId: string; direction: "LEFT" | "RIGHT" }
);

export type TraceMetadata = { timeComplexity: string; spaceComplexity: string; executionTimeMs: number; nodeCount: number };
export interface ExecutionTrace { events: VisualizationEvent[]; metadata: TraceMetadata; }
