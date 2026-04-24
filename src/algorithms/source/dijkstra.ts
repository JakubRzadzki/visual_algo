type Graph = Record<string, { node: string; weight: number }[]>;

export function dijkstra(graph: Graph, source: string) {
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited = new Set<string>();

  for (const vertex in graph) {
    distances[vertex] = Infinity;
    previous[vertex] = null;
    unvisited.add(vertex);
  }
  distances[source] = 0;

  while (unvisited.size > 0) {
    // Find the unvisited node with the smallest distance
    let current: string | null = null;
    let minDistance = Infinity;

    for (const node of unvisited) {
      if (distances[node] < minDistance) {
        minDistance = distances[node];
        current = node;
      }
    }

    if (current === null) break;

    unvisited.delete(current);

    // Update distances of neighbors
    for (const neighbor of graph[current] || []) {
      const alt = distances[current] + neighbor.weight;
      if (alt < distances[neighbor.node]) {
        distances[neighbor.node] = alt;
        previous[neighbor.node] = current;
      }
    }
  }

  return { distances, previous };
}
