/**
 * Algorithm Catalog — Central registry of all algorithms organized by category.
 * Used by the Dashboard for navigation and by the Visualizer for algorithm loading.
 */

export interface AlgorithmEntry {
  id: string;
  name: string;
  shortName: string;
  description: string;
  timeComplexity: string;
  spaceComplexity: string;
  available: boolean; // false = coming soon
}

export interface CategoryEntry {
  id: string;
  label: string;
  iconImage: string; // path to category icon in /public/images/categories/
  color: string;       // tailwind gradient class
  borderColor: string; // tailwind border class
  glowColor: string;   // tailwind shadow class
  algorithms: AlgorithmEntry[];
}

export const ALGORITHM_CATALOG: CategoryEntry[] = [
  {
    id: 'sorting',
    label: 'A — Sorting',
    iconImage: '/images/categories/sorting.png',
    color: 'from-sky-500/20 to-cyan-500/10',
    borderColor: 'border-sky-500/30',
    glowColor: 'shadow-sky-500/10',
    algorithms: [
      { id: 'merge-sort',  name: 'Merge Sort',  shortName: 'Merge',  description: 'Divide-and-conquer comparison sort',         timeComplexity: 'O(n log n)', spaceComplexity: 'O(n)',     available: true },
      { id: 'quick-sort',  name: 'Quick Sort',  shortName: 'Quick',  description: 'In-place partitioning sort',                 timeComplexity: 'O(n log n)', spaceComplexity: 'O(log n)', available: true },
      { id: 'bubble-sort', name: 'Bubble Sort', shortName: 'Bubble', description: 'Simple comparison-based sort',                timeComplexity: 'O(n²)',      spaceComplexity: 'O(1)',     available: true },
      { id: 'heap-sort',   name: 'Heap Sort',   shortName: 'Heap',   description: 'Binary heap based comparison sort',           timeComplexity: 'O(n log n)', spaceComplexity: 'O(1)',     available: true },
    ],
  },
  {
    id: 'searching',
    label: 'B — Searching',
    iconImage: '/images/categories/searching.png',
    color: 'from-violet-500/20 to-purple-500/10',
    borderColor: 'border-violet-500/30',
    glowColor: 'shadow-violet-500/10',
    algorithms: [
      { id: 'binary-search', name: 'Binary Search', shortName: 'Binary', description: 'Efficient sorted-array search',          timeComplexity: 'O(log n)', spaceComplexity: 'O(1)', available: true },
      { id: 'linear-search', name: 'Linear Search', shortName: 'Linear', description: 'Sequential element-by-element scan',    timeComplexity: 'O(n)',     spaceComplexity: 'O(1)', available: true },
    ],
  },
  {
    id: 'graphs',
    label: 'C — Graphs',
    iconImage: '/images/categories/graphs.png',
    color: 'from-emerald-500/20 to-teal-500/10',
    borderColor: 'border-emerald-500/30',
    glowColor: 'shadow-emerald-500/10',
    algorithms: [
      { id: 'dijkstra',  name: "Dijkstra's Shortest Path", shortName: 'Dijkstra', description: 'Single-source shortest path with priority queue', timeComplexity: 'O((V+E) log V)', spaceComplexity: 'O(V)', available: true },
      { id: 'kruskal',   name: "Kruskal's MST",            shortName: 'Kruskal',  description: 'Minimum spanning tree via edge sorting',          timeComplexity: 'O(E log E)',      spaceComplexity: 'O(V)', available: true },
      { id: 'bfs',       name: 'Breadth-First Search',     shortName: 'BFS',      description: 'Level-order graph traversal',                     timeComplexity: 'O(V + E)',        spaceComplexity: 'O(V)', available: true },
      { id: 'dfs',       name: 'Depth-First Search',       shortName: 'DFS',      description: 'Stack-based deep graph traversal',                timeComplexity: 'O(V + E)',        spaceComplexity: 'O(V)', available: true },
      { id: 'prim',      name: "Prim's MST",               shortName: 'Prim',     description: 'Minimum spanning tree via vertex growth',         timeComplexity: 'O((V+E) log V)', spaceComplexity: 'O(V)', available: true },
      { id: 'topo-sort', name: 'Topological Sort',         shortName: 'TopoSort', description: 'DAG linear ordering',                             timeComplexity: 'O(V + E)',        spaceComplexity: 'O(V)', available: true },
    ],
  },
  {
    id: 'trees',
    label: 'D — Trees',
    iconImage: '/images/categories/trees.png',
    color: 'from-amber-500/20 to-orange-500/10',
    borderColor: 'border-amber-500/30',
    glowColor: 'shadow-amber-500/10',
    algorithms: [
      { id: 'bst',        name: 'Binary Search Tree', shortName: 'BST',       description: 'Ordered insertion & search tree',       timeComplexity: 'O(log n)', spaceComplexity: 'O(n)', available: true },
      { id: 'avl',        name: 'AVL Tree',           shortName: 'AVL',       description: 'Self-balancing BST with rotations',     timeComplexity: 'O(log n)', spaceComplexity: 'O(n)', available: true },
      { id: 'max-heap',   name: 'Max Heap',           shortName: 'MaxHeap',   description: 'Complete binary tree max-heap property', timeComplexity: 'O(log n)', spaceComplexity: 'O(n)', available: true },
      { id: 'union-find', name: 'Union-Find',         shortName: 'UnionFind', description: 'Disjoint set with path compression',    timeComplexity: 'O(α(n))',  spaceComplexity: 'O(n)', available: true },
    ],
  },
  {
    id: 'dp',
    label: 'E — Dynamic Programming',
    iconImage: '/images/categories/dp.png',
    color: 'from-rose-500/20 to-pink-500/10',
    borderColor: 'border-rose-500/30',
    glowColor: 'shadow-rose-500/10',
    algorithms: [
      { id: 'knapsack', name: '0/1 Knapsack', shortName: 'Knapsack', description: 'Optimal value under weight constraint', timeComplexity: 'O(nW)', spaceComplexity: 'O(nW)', available: false },
      { id: 'lcs',      name: 'Longest Common Subsequence', shortName: 'LCS', description: 'Longest shared subsequence of two strings', timeComplexity: 'O(mn)', spaceComplexity: 'O(mn)', available: false },
    ],
  },
  {
    id: 'grid',
    label: 'F — Grid / Mazes',
    iconImage: '/images/categories/grid.png',
    color: 'from-indigo-500/20 to-blue-500/10',
    borderColor: 'border-indigo-500/30',
    glowColor: 'shadow-indigo-500/10',
    algorithms: [
      { id: 'a-star',     name: 'A* Search',  shortName: 'A*',    description: 'Heuristic best-first pathfinding', timeComplexity: 'O(E)',  spaceComplexity: 'O(V)', available: false },
      { id: 'flood-fill', name: 'Flood Fill', shortName: 'Flood', description: 'Region-filling flood algorithm',   timeComplexity: 'O(mn)', spaceComplexity: 'O(mn)', available: false },
    ],
  },
];

/** Flat lookup helpers */
export function findAlgorithm(categoryId: string, algoId: string) {
  const cat = ALGORITHM_CATALOG.find(c => c.id === categoryId);
  if (!cat) return null;
  const algo = cat.algorithms.find(a => a.id === algoId);
  return algo ? { category: cat, algorithm: algo } : null;
}

export function getAllAlgorithms() {
  return ALGORITHM_CATALOG.flatMap(cat =>
    cat.algorithms.map(algo => ({ category: cat, algorithm: algo }))
  );
}

/**
 * Looks up an algorithm by its full name (e.g., "Dijkstra's Path" or "Merge Sort")
 */
export function findAlgorithmByName(name: string) {
  const all = getAllAlgorithms();
  // Try exact match first
  let match = all.find(a => a.algorithm.name === name);
  
  // Fallback for legacy snapshot names (e.g., "Dijkstra's Path" -> "Dijkstra's Shortest Path")
  if (!match) {
    if (name.includes('Dijkstra')) match = all.find(a => a.algorithm.id === 'dijkstra');
    else if (name.includes('Kruskal')) match = all.find(a => a.algorithm.id === 'kruskal');
    else match = all.find(a => a.algorithm.name.includes(name) || name.includes(a.algorithm.name));
  }
  return match || null;
}
