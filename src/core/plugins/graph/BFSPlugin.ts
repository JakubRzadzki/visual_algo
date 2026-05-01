import type { AlgorithmPlugin, ExecutionTrace, GraphInput, VisualizationEvent, EventPayload } from '../../../types';

export class BFSPlugin implements AlgorithmPlugin<GraphInput> {
  id = 'bfs';
  name = 'Breadth-First Search';
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
      push({ type: 'SYSTEM_LOG', level: 'ERROR', message: 'No nodes provided to BFS.' });
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
    const queue: string[] = [source];
    visited.add(source);

    // Highlight the source node
    push({ type: 'GRAPH_NODE_HIGHLIGHT', nodeId: source, distance: 0 });

    while (queue.length > 0) {
      const u = queue.shift()!;

      for (const { to: v, edgeId } of adj[u] ?? []) {
        // Highlight the edge being explored
        push({ type: 'GRAPH_EDGE_HIGHLIGHT', edgeId, accepted: !visited.has(v) });

        if (!visited.has(v)) {
          visited.add(v);
          queue.push(v);
          // Highlight the newly discovered node
          push({ type: 'GRAPH_NODE_HIGHLIGHT', nodeId: v });
        }
      }
    }

    const endTime = performance.now();

    push({
      type: 'SYSTEM_LOG',
      level: 'INFO',
      message: `BFS complete from "${source}". Visited ${visited.size} of ${nodes.length} nodes.`,
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
