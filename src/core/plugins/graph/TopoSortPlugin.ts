import type { AlgorithmPlugin, ExecutionTrace, GraphInput, VisualizationEvent, EventPayload } from '../../../types';

export class TopoSortPlugin implements AlgorithmPlugin<GraphInput> {
  id = 'topo-sort';
  name = 'Topological Sort';
  category = 'graph' as const;

  /**
   * Kahn's algorithm for topological ordering of a Directed Acyclic Graph (DAG).
   * Emits GRAPH_NODE_HIGHLIGHT when a node is added to the result,
   * and GRAPH_EDGE_HIGHLIGHT when an edge is processed (in-degree reduced).
   */
  execute(data: GraphInput): ExecutionTrace {
    const { nodes, edges } = data;
    const events: VisualizationEvent[] = [];
    let step = 0;
    const startTime = performance.now();

    const push = (evt: EventPayload) => {
      events.push({
        ...evt,
        id: crypto.randomUUID(),
        timestamp: performance.now(),
        step: step++,
      } as VisualizationEvent);
    };

    if (nodes.length === 0) {
      push({ type: 'SYSTEM_LOG', level: 'ERROR', message: 'No nodes provided to Topological Sort.' });
      return { events, metadata: { timeComplexity: 'O(V + E)', spaceComplexity: 'O(V)', executionTimeMs: 0, nodeCount: 0, algorithmName: this.name } };
    }

    // Build adjacency list (directed) and compute in-degrees
    const adj: Record<string, { to: string; edgeId: string }[]> = {};
    const inDegree: Record<string, number> = {};

    for (const n of nodes) {
      adj[n.id] = [];
      inDegree[n.id] = 0;
    }

    for (const e of edges) {
      adj[e.from]?.push({ to: e.to, edgeId: e.id });
      inDegree[e.to] = (inDegree[e.to] ?? 0) + 1;
    }

    // Initialize the queue with all nodes that have in-degree 0
    const queue: string[] = [];
    for (const n of nodes) {
      if (inDegree[n.id] === 0) {
        queue.push(n.id);
      }
    }

    const result: string[] = [];

    while (queue.length > 0) {
      const u = queue.shift()!;
      result.push(u);

      // Highlight the node being added to the topological order
      push({ type: 'GRAPH_NODE_HIGHLIGHT', nodeId: u });

      for (const { to: v, edgeId } of adj[u] ?? []) {
        inDegree[v]--;

        // Highlight the edge (accepted = true means we successfully reduced in-degree)
        push({ type: 'GRAPH_EDGE_HIGHLIGHT', edgeId, accepted: true });

        if (inDegree[v] === 0) {
          queue.push(v);
        }
      }
    }

    const endTime = performance.now();

    const hasCycle = result.length !== nodes.length;
    push({
      type: 'SYSTEM_LOG',
      level: hasCycle ? 'WARN' : 'INFO',
      message: hasCycle
        ? `Topological Sort incomplete — cycle detected. Ordered ${result.length} of ${nodes.length} nodes.`
        : `Topological Sort complete. Order: ${result.join(' → ')}.`,
    });

    return {
      events,
      metadata: {
        timeComplexity: 'O(V + E)',
        spaceComplexity: 'O(V)',
        executionTimeMs: endTime - startTime,
        nodeCount: nodes.length,
        algorithmName: this.name,
      },
    };
  }
}
