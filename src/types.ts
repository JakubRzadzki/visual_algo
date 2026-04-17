export type BaseEvent = { id: string; timestamp: number; step: number; eventSource?: string; lineNumber?: number; isReverse?: boolean };

export type EventPayload = 
  | { type: "ARRAY_COMPARE"; indices: [number, number] }
  | { type: "ARRAY_SWAP"; indices: [number, number]; values: [number, number] }
  | { type: "ARRAY_SET"; index: number; value: number; previousValue?: number }
  | { type: "GRAPH_RELAX"; edgeId: string; weight: number }
  | { type: "TREE_ROTATE"; pivotId: string; direction: "LEFT" | "RIGHT" }
  | { type: "SYSTEM_LOG"; message: string; level: "INFO" | "WARN" | "ERROR" }
  | { type: "SYSTEM_PLAYBACK_STATE"; isPlaying: boolean; currentStep: number; totalSteps: number; speed: number }
  | { type: "TRACE_LOADED"; metadata: TraceMetadata };

export type VisualizationEvent = BaseEvent & EventPayload;

export type TraceMetadata = { timeComplexity: string; spaceComplexity: string; executionTimeMs: number; nodeCount: number; algorithmName: string; initialState?: any };
export interface ExecutionTrace { events: VisualizationEvent[]; metadata: TraceMetadata; }

/** Plugin Abstraction for deterministic algorithm generation */
export interface AlgorithmPlugin<InputShape = any> {
  id: string; // e.g., 'merge-sort'
  name: string; // e.g., 'Merge Sort'
  category: 'sorting' | 'graph' | 'tree' | 'dp';
  execute(data: InputShape): ExecutionTrace;
}
