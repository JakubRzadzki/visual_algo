import type {
  AlgorithmPlugin,
  ExecutionTrace,
  GraphInput,
  VisualizationEvent,
  EventPayload,
} from "../../../types";

export class DijkstraPlugin implements AlgorithmPlugin<GraphInput> {
  id = "dijkstra";
  name = "Dijkstra Shortest Path";
  category = "graph" as const;

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

    // Distance map, initialised to Infinity
    const dist: Record<string, number> = {};
    for (const n of nodes) dist[n.id] = Infinity;

    const source = startNodeId ?? nodes[0]?.id;
    if (!source) {
      push({
        type: "SYSTEM_LOG",
        level: "ERROR",
        message: "No nodes provided to Dijkstra.",
      });
      return {
        events,
        metadata: {
          timeComplexity: "O((V+E) log V)",
          spaceComplexity: "O(V)",
          executionTimeMs: 0,
          nodeCount: 0,
          algorithmName: this.name,
        },
      };
    }

    dist[source] = 0;

    // Simple min-priority queue via sorted array (sufficient for visualisation scale)
    const pq: { id: string; priority: number }[] = [
      { id: source, priority: 0 },
    ];

    // Build adjacency list from edge list
    const adj: Record<string, { to: string; edge: (typeof edges)[0] }[]> = {};
    for (const n of nodes) adj[n.id] = [];
    for (const e of edges) {
      adj[e.from]?.push({ to: e.to, edge: e });
      adj[e.to]?.push({ to: e.from, edge: e }); // undirected
    }

    const visited = new Set<string>();

    while (pq.length > 0) {
      // Pop the node with the smallest tentative distance
      pq.sort((a, b) => a.priority - b.priority);
      const { id: u, priority } = pq.shift()!;

      if (visited.has(u)) continue;
      visited.add(u);

      // Highlight current processing node
      push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: u, distance: priority });

      for (const { to: v, edge } of adj[u] ?? []) {
        if (visited.has(v)) continue;

        const alt = dist[u] + edge.weight;

        // Visualize the edge being considered
        push({
          type: "GRAPH_EDGE_HIGHLIGHT",
          edgeId: edge.id,
          accepted: alt < dist[v],
        });

        if (alt < dist[v]) {
          dist[v] = alt;
          pq.push({ id: v, priority: alt });
          // Emit relax event so the renderer can react to the updated distance
          push({ type: "GRAPH_RELAX", edgeId: edge.id, weight: alt });
        }
      }
    }

    const endTime = performance.now();

    // Final summary log
    push({
      type: "SYSTEM_LOG",
      level: "INFO",
      message: `Dijkstra complete from "${source}". Relaxed ${step - 1} edges.`,
    });

    return {
      events,
      metadata: {
        timeComplexity: "O((V+E) log V)",
        spaceComplexity: "O(V)",
        executionTimeMs: endTime - startTime,
        nodeCount: nodes.length,
        algorithmName: this.name,
      },
    };
  }
}
