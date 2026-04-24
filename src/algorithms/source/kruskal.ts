interface Edge {
  u: string;
  v: string;
  weight: number;
}

export function kruskal(nodes: string[], edges: Edge[]) {
  // Sort edges by weight
  edges.sort((a, b) => a.weight - b.weight);

  const parent: Record<string, string> = {};
  
  // Initialize disjoint set
  for (const node of nodes) {
    parent[node] = node;
  }

  // Find root
  function find(i: string): string {
    if (parent[i] === i) return i;
    return find(parent[i]);
  }

  // Union
  function union(i: string, j: string) {
    const rootI = find(i);
    const rootJ = find(j);
    parent[rootI] = rootJ;
  }

  const mst: Edge[] = [];

  for (const edge of edges) {
    const rootU = find(edge.u);
    const rootV = find(edge.v);

    // If adding this edge doesn't cause a cycle
    if (rootU !== rootV) {
      mst.push(edge);
      union(rootU, rootV);
    }
  }

  return mst;
}
