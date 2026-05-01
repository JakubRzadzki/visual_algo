import type { AlgorithmPlugin, ExecutionTrace, GraphInput, VisualizationEvent, EventPayload } from '../../../types';

export class DFSPlugin implements AlgorithmPlugin<GraphInput> {
  id = 'dfs';
  name = 'Depth-First Search';
  category = 'graph' as const;

  execute(data: GraphInput): ExecutionTrace {
    const { nodes, edges, startNodeId } = data;
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

    const source = startNodeId ?? nodes[0]?.id;
    if (!source) {
      push({ type: 'SYSTEM_LOG', level: 'ERROR', message: 'No nodes provided to DFS.' });
      return { events, metadata: { timeComplexity: 'O(V + E)', spaceComplexity: 'O(V)', executionTimeMs: 0, nodeCount: 0, algorithmName: this.name } };
    }

    // Build adjacency list
    const adj: Record<string, { to: string; edgeId: string }[]> = {};
    for (const n of nodes) adj[n.id] = [];
    for (const e of edges) {
      adj[e.from]?.push({ to: e.to, edgeId: e.id });
      adj[e.to]?.push({ to: e.from, edgeId: e.id }); // undirected
    }

    const visited = new Set<string>();

    // Iterative DFS using an explicit stack
    const stack: string[] = [source];

    while (stack.length > 0) {
      const u = stack.pop()!;

      if (visited.has(u)) continue;
      visited.add(u);

      // Highlight the visited node
      push({ type: 'GRAPH_NODE_HIGHLIGHT', nodeId: u });

      // Explore neighbors (reversed to maintain left-to-right order in visualization)
      const neighbors = (adj[u] ?? []).slice().reverse();
      for (const { to: v, edgeId } of neighbors) {
        // Highlight the edge being explored
        push({ type: 'GRAPH_EDGE_HIGHLIGHT', edgeId, accepted: !visited.has(v) });

        if (!visited.has(v)) {
          stack.push(v);
        }
      }
    }

    const endTime = performance.now();

    push({
      type: 'SYSTEM_LOG',
      level: 'INFO',
      message: `DFS complete from "${source}". Visited ${visited.size} of ${nodes.length} nodes.`,
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
