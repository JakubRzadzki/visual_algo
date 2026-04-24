// ─── Algorithm Catalog ─────────────────────────────────────────────────────────
// Single source of truth for all algorithm categories, metadata, and routing.
// "available" algorithms are those with implemented plugins; others show as
// "Coming Soon" pills on the Dashboard.

export interface AlgorithmEntry {
  id: string;
  name: string;
  available: boolean;
  timeComplexity: string;
  spaceComplexity: string;
  description: string;
}

export interface CategoryEntry {
  id: string;
  letter: string;
  name: string;
  icon: string;
  color: string;        // tailwind-style accent for cards / pills
  borderColor: string;
  bgColor: string;
  algorithms: AlgorithmEntry[];
}

export const ALGORITHM_CATALOG: CategoryEntry[] = [
  {
    id: 'sorting',
    letter: 'A',
    name: 'Sorting',
    icon: '📊',
    color: 'text-sky-400',
    borderColor: 'border-sky-500/30',
    bgColor: 'bg-sky-500/10',
    algorithms: [
      { id: 'merge-sort',  name: 'Merge Sort',  available: true,  timeComplexity: 'O(n log n)', spaceComplexity: 'O(n)',     description: 'Divide-and-conquer sort that recursively splits and merges.' },
      { id: 'quick-sort',  name: 'Quick Sort',  available: true,  timeComplexity: 'O(n log n)', spaceComplexity: 'O(log n)', description: 'In-place partition-based sort using Lomuto scheme.' },
      { id: 'bubble-sort', name: 'Bubble Sort', available: false, timeComplexity: 'O(n²)',      spaceComplexity: 'O(1)',     description: 'Simple comparison sort that bubbles largest to the end.' },
      { id: 'heap-sort',   name: 'Heap Sort',   available: false, timeComplexity: 'O(n log n)', spaceComplexity: 'O(1)',     description: 'Comparison sort using a binary heap data structure.' },
    ],
  },
  {
    id: 'searching',
    letter: 'B',
    name: 'Searching',
    icon: '🔍',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    bgColor: 'bg-emerald-500/10',
    algorithms: [
      { id: 'linear-search', name: 'Linear Search', available: false, timeComplexity: 'O(n)',     spaceComplexity: 'O(1)',     description: 'Sequential scan through every element.' },
      { id: 'binary-search', name: 'Binary Search', available: false, timeComplexity: 'O(log n)', spaceComplexity: 'O(1)',     description: 'Divide-and-conquer search on sorted arrays.' },
    ],
  },
  {
    id: 'graphs',
    letter: 'C',
    name: 'Graphs',
    icon: '🕸️',
    color: 'text-violet-400',
    borderColor: 'border-violet-500/30',
    bgColor: 'bg-violet-500/10',
    algorithms: [
      { id: 'dijkstra',   name: "Dijkstra's Path",  available: true,  timeComplexity: 'O((V+E) log V)', spaceComplexity: 'O(V)', description: 'Greedy single-source shortest path algorithm.' },
      { id: 'kruskal',    name: "Kruskal's MST",    available: true,  timeComplexity: 'O(E log E)',     spaceComplexity: 'O(V)', description: 'Greedy minimum spanning tree via Union-Find.' },
      { id: 'bfs',        name: 'BFS',              available: false, timeComplexity: 'O(V + E)',       spaceComplexity: 'O(V)', description: 'Breadth-first search using a queue.' },
      { id: 'dfs',        name: 'DFS',              available: false, timeComplexity: 'O(V + E)',       spaceComplexity: 'O(V)', description: 'Depth-first search using a stack / recursion.' },
      { id: 'topo-sort',  name: 'Topological Sort', available: false, timeComplexity: 'O(V + E)',       spaceComplexity: 'O(V)', description: 'Linear ordering of DAG vertices.' },
    ],
  },
  {
    id: 'trees',
    letter: 'D',
    name: 'Trees',
    icon: '🌳',
    color: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    bgColor: 'bg-amber-500/10',
    algorithms: [
      { id: 'bst-insert', name: 'BST Insert/Delete', available: false, timeComplexity: 'O(h)',     spaceComplexity: 'O(h)',   description: 'Binary Search Tree insertion and deletion.' },
      { id: 'avl-tree',   name: 'AVL Tree',          available: false, timeComplexity: 'O(log n)', spaceComplexity: 'O(n)',   description: 'Self-balancing BST with rotations.' },
      { id: 'max-heap',   name: 'Max Heap',          available: false, timeComplexity: 'O(log n)', spaceComplexity: 'O(n)',   description: 'Priority queue via complete binary tree.' },
    ],
  },
  {
    id: 'dp',
    letter: 'E',
    name: 'Dynamic Programming',
    icon: '🧩',
    color: 'text-rose-400',
    borderColor: 'border-rose-500/30',
    bgColor: 'bg-rose-500/10',
    algorithms: [
      { id: 'knapsack', name: '0/1 Knapsack', available: false, timeComplexity: 'O(nW)', spaceComplexity: 'O(nW)', description: 'Classic DP problem — maximize value within weight.' },
      { id: 'lcs',      name: 'LCS',          available: false, timeComplexity: 'O(mn)', spaceComplexity: 'O(mn)', description: 'Longest Common Subsequence of two strings.' },
    ],
  },
  {
    id: 'grid',
    letter: 'F',
    name: 'Grid / Mazes',
    icon: '🗺️',
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/30',
    bgColor: 'bg-cyan-500/10',
    algorithms: [
      { id: 'a-star',     name: 'A* Search',  available: false, timeComplexity: 'O(E)', spaceComplexity: 'O(V)', description: 'Informed pathfinding with heuristics.' },
      { id: 'flood-fill', name: 'Flood Fill', available: false, timeComplexity: 'O(n)', spaceComplexity: 'O(n)', description: 'Region filling algorithm (BFS/DFS on grids).' },
    ],
  },
];

/** Flat list of all available algorithms for search */
export function getAllAlgorithms() {
  return ALGORITHM_CATALOG.flatMap(cat =>
    cat.algorithms.map(algo => ({ ...algo, category: cat }))
  );
}

/** Find an algorithm by its id */
export function findAlgorithmById(id: string) {
  for (const cat of ALGORITHM_CATALOG) {
    const algo = cat.algorithms.find(a => a.id === id);
    if (algo) return { algo, category: cat };
  }
  return null;
}
