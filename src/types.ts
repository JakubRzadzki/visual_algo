export type BaseEvent = { id: string; timestamp: number; step: number; eventSource?: string };

export type VisualizationEvent = BaseEvent & (
  | { type: "ARRAY_COMPARE"; indices: [number, number] }
  | { type: "ARRAY_SWAP"; indices: [number, number]; values: [number, number] }
  | { type: "ARRAY_SET"; index: number; value: number }
  | { type: "GRAPH_RELAX"; edgeId: string; weight: number }
  | { type: "TREE_ROTATE"; pivotId: string; direction: "LEFT" | "RIGHT" }
  | { type: "SYSTEM_LOG"; message: string; level: "INFO" | "WARN" | "ERROR" }
);

export type TraceMetadata = { timeComplexity: string; spaceComplexity: string; executionTimeMs: number; nodeCount: number; algorithmName: string };
export interface ExecutionTrace { events: VisualizationEvent[]; metadata: TraceMetadata; }

/** Plugin Abstraction for deterministic algorithm generation */
export interface AlgorithmPlugin<InputShape = any> {
  id: string; // e.g., 'merge-sort'
  name: string; // e.g., 'Merge Sort'
  category: 'sorting' | 'graph' | 'tree' | 'dp';
  execute(data: InputShape): ExecutionTrace;
}
