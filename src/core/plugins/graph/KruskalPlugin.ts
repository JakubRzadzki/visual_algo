import type {
  AlgorithmPlugin,
  ExecutionTrace,
  GraphInput,
  VisualizationEvent,
  EventPayload,
} from "../../../types";

export class KruskalPlugin implements AlgorithmPlugin<GraphInput> {
  id = "kruskal";
  name = "Kruskal MST";
  category = "graph" as const;

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

    // ─── Union-Find ───────────────────────────────────────────────────────────
    const parent: Record<string, string> = {};
    const rank: Record<string, number> = {};

    for (const n of nodes) {
      parent[n.id] = n.id;
      rank[n.id] = 0;
    }

    const find = (x: string): string => {
      if (parent[x] !== x) parent[x] = find(parent[x]); // path compression
      return parent[x];
    };

    const union = (x: string, y: string): boolean => {
      const px = find(x);
      const py = find(y);
      if (px === py) return false; // already in the same component

      // Union by rank to keep tree shallow
      if (rank[px] < rank[py]) {
        parent[px] = py;
      } else if (rank[px] > rank[py]) {
        parent[py] = px;
      } else {
        parent[py] = px;
        rank[px]++;
      }
      return true;
    };
    // ─────────────────────────────────────────────────────────────────────────

    // Sort edges by weight ascending (Kruskal's greedy criterion)
    const sorted = [...edges].sort((a, b) => a.weight - b.weight);

    let mstWeight = 0;
    let edgesAdded = 0;

    for (const edge of sorted) {
      const accepted = union(edge.from, edge.to);

      // Emit highlight — green if accepted into MST, red if cycle would form
      push({ type: "GRAPH_EDGE_HIGHLIGHT", edgeId: edge.id, accepted });

      if (accepted) {
        mstWeight += edge.weight;
        edgesAdded++;
      }

      // Early exit: MST of V nodes has V-1 edges
      if (edgesAdded === nodes.length - 1) break;
    }

    const endTime = performance.now();

    push({
      type: "SYSTEM_LOG",
      level: "INFO",
      message: `Kruskal MST complete. Total weight: ${mstWeight}. Edges in tree: ${edgesAdded}.`,
    });

    return {
      events,
      metadata: {
        timeComplexity: "O(E log E)",
        spaceComplexity: "O(V)",
        executionTimeMs: endTime - startTime,
        nodeCount: nodes.length,
        algorithmName: this.name,
      },
    };
  }
}
