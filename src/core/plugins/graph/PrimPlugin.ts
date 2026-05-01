import type { AlgorithmPlugin, ExecutionTrace, GraphInput, VisualizationEvent, EventPayload } from '../../../types';

export class PrimPlugin implements AlgorithmPlugin<GraphInput> {
  id = 'prim';
  name = "Prim's MST";
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

    if (nodes.length === 0) {
      push({ type: 'SYSTEM_LOG', level: 'ERROR', message: 'No nodes provided to Prim.' });
      return { events, metadata: { timeComplexity: 'O((V+E) log V)', spaceComplexity: 'O(V)', executionTimeMs: 0, nodeCount: 0, algorithmName: this.name } };
    }

    // Build adjacency list (undirected)
    const adj: Record<string, { to: string; weight: number; edgeId: string }[]> = {};
    for (const n of nodes) adj[n.id] = [];
    for (const e of edges) {
      adj[e.from]?.push({ to: e.to, weight: e.weight, edgeId: e.id });
      adj[e.to]?.push({ to: e.from, weight: e.weight, edgeId: e.id });
    }

    const source = startNodeId ?? nodes[0].id;
    const inMST = new Set<string>();
    let mstWeight = 0;
    let edgesAdded = 0;

    // Priority queue of candidate edges: [weight, nodeId, edgeId]
    type PQEntry = { weight: number; nodeId: string; edgeId: string };
    const pq: PQEntry[] = [];

    // Start from source
    inMST.add(source);
    push({ type: 'GRAPH_NODE_HIGHLIGHT', nodeId: source });

    // Add all edges from source to the PQ
    for (const neighbor of adj[source] ?? []) {
      pq.push({ weight: neighbor.weight, nodeId: neighbor.to, edgeId: neighbor.edgeId });
    }

    while (pq.length > 0 && edgesAdded < nodes.length - 1) {
      // Extract minimum weight edge
      pq.sort((a, b) => a.weight - b.weight);
      const { weight, nodeId, edgeId } = pq.shift()!;

      if (inMST.has(nodeId)) {
        // Edge leads to an already-included node — reject
        push({ type: 'GRAPH_EDGE_HIGHLIGHT', edgeId, accepted: false });
        continue;
      }

      // Accept this edge into the MST
      inMST.add(nodeId);
      mstWeight += weight;
      edgesAdded++;
      push({ type: 'GRAPH_EDGE_HIGHLIGHT', edgeId, accepted: true });
      push({ type: 'GRAPH_NODE_HIGHLIGHT', nodeId });

      // Add all edges from the newly added node
      for (const neighbor of adj[nodeId] ?? []) {
        if (!inMST.has(neighbor.to)) {
          pq.push({ weight: neighbor.weight, nodeId: neighbor.to, edgeId: neighbor.edgeId });
        }
      }
    }

    const endTime = performance.now();

    push({
      type: 'SYSTEM_LOG',
      level: 'INFO',
      message: `Prim's MST complete. Total weight: ${mstWeight}. Edges in tree: ${edgesAdded}.`,
    });

    return {
      events,
      metadata: {
        timeComplexity: 'O((V+E) log V)',
        spaceComplexity: 'O(V)',
        executionTimeMs: endTime - startTime,
        nodeCount: nodes.length,
        algorithmName: this.name,
      },
    };
  }
}
