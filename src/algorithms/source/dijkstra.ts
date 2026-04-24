// ─── Dijkstra's Shortest Path ──────────────────────────────────────────────────
// Time:  O((V + E) log V) with a min-heap priority queue
// Space: O(V)
//
// Greedy single-source shortest path for graphs with non-negative weights.
// Uses a priority queue (min-heap) to always expand the closest unvisited node.

interface Edge {
  to: string;
  weight: number;
}

type AdjacencyList = Record<string, Edge[]>;

function dijkstra(
  adj: AdjacencyList,
  source: string,
  nodeIds: string[]
): Record<string, number> {
  // Initialise distances to Infinity
  const dist: Record<string, number> = {};
  for (const id of nodeIds) dist[id] = Infinity;
  dist[source] = 0;

  // Simple priority queue via sorted array (sufficient for visualisation scale)
  const pq: { id: string; priority: number }[] = [{ id: source, priority: 0 }];

  while (pq.length > 0) {
    pq.sort((a, b) => a.priority - b.priority);
    const { id: u } = pq.shift()!;

    for (const { to: v, weight: w } of adj[u] ?? []) {
      const alt = dist[u] + w;

      if (alt < dist[v]) {
        dist[v] = alt;
        pq.push({ id: v, priority: alt });
      }
    }
  }

  return dist;
}

// Example usage:
// const adj: AdjacencyList = {
//   A: [{ to: 'B', weight: 4 }, { to: 'C', weight: 1 }],
//   B: [{ to: 'D', weight: 1 }],
//   C: [{ to: 'B', weight: 2 }, { to: 'D', weight: 5 }],
//   D: [],
// };
// const result = dijkstra(adj, 'A', ['A', 'B', 'C', 'D']);
// console.log(result); // → { A: 0, B: 3, C: 1, D: 4 }

export { dijkstra };
export type { Edge, AdjacencyList };
