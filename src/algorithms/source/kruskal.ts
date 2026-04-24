// ─── Kruskal's Minimum Spanning Tree ───────────────────────────────────────────
// Time:  O(E log E) — dominated by edge sorting
// Space: O(V)       — Union-Find parent + rank arrays
//
// Greedy algorithm: sort all edges by weight ascending, then greedily add
// edges that don't form a cycle (checked via Union-Find / Disjoint Set).

interface GraphEdge {
  id: string;
  from: string;
  to: string;
  weight: number;
}

function find(parent: Record<string, string>, x: string): string {
  if (parent[x] !== x) {
    parent[x] = find(parent, parent[x]); // Path compression
  }
  return parent[x];
}

function union(
  parent: Record<string, string>,
  rank: Record<string, number>,
  x: string,
  y: string
): boolean {
  const px = find(parent, x);
  const py = find(parent, y);
  if (px === py) return false; // Already in the same component

  // Union by rank
  if (rank[px] < rank[py]) parent[px] = py;
  else if (rank[px] > rank[py]) parent[py] = px;
  else { parent[py] = px; rank[px]++; }

  return true;
}

function kruskal(nodeIds: string[], edges: GraphEdge[]): GraphEdge[] {
  // Initialise Union-Find
  const parent: Record<string, string> = {};
  const rank: Record<string, number> = {};
  for (const id of nodeIds) {
    parent[id] = id;
    rank[id] = 0;
  }

  // Sort edges by weight (greedy criterion)
  const sorted = [...edges].sort((a, b) => a.weight - b.weight);

  const mstEdges: GraphEdge[] = [];

  for (const edge of sorted) {
    if (union(parent, rank, edge.from, edge.to)) {
      mstEdges.push(edge);
    }
    // MST of V nodes has V-1 edges
    if (mstEdges.length === nodeIds.length - 1) break;
  }

  return mstEdges;
}

// Example usage:
// const nodes = ['A', 'B', 'C', 'D'];
// const edges = [
//   { id: 'e1', from: 'A', to: 'B', weight: 4 },
//   { id: 'e2', from: 'A', to: 'C', weight: 1 },
//   { id: 'e3', from: 'B', to: 'C', weight: 2 },
//   { id: 'e4', from: 'C', to: 'D', weight: 5 },
// ];
// const mst = kruskal(nodes, edges);
// console.log(mst.map(e => `${e.from}-${e.to}: ${e.weight}`));

export { kruskal, find, union };
export type { GraphEdge };
