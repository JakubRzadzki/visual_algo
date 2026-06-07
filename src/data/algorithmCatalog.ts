/**
 * Algorithm Catalog — Central registry of all algorithms organized by category.
 * Used by the Dashboard for navigation and by the Visualizer for algorithm loading.
 */

export interface AlgorithmEntry {
  id: string;
  name: string;
  name_pl: string;
  shortName: string;
  shortName_pl: string;
  description: string;
  description_pl: string;
  timeComplexity: string;
  spaceComplexity: string;
  available: boolean; // false = coming soon
}

export interface CategoryEntry {
  id: string;
  label: string;
  label_pl: string;
  iconImage: string; // path to category icon in /public/images/categories/
  color: string; // tailwind gradient class
  borderColor: string; // tailwind border class
  glowColor: string; // tailwind shadow class
  algorithms: AlgorithmEntry[];
}

export const ALGORITHM_CATALOG: CategoryEntry[] = [
  {
    id: "sorting",
    label: "A — Sorting",
    label_pl: "A — Sortowanie",
    iconImage: "/images/categories/sorting.png",
    color: "from-sky-500/20 to-cyan-500/10",
    borderColor: "border-sky-500/30",
    glowColor: "shadow-sky-500/10",
    algorithms: [
      {
        id: "merge-sort",
        name: "Merge Sort",
        name_pl: "Sortowanie przez scalanie",
        shortName: "Merge",
        shortName_pl: "Scalanie",
        description: "Divide-and-conquer comparison sort",
        description_pl: "Sortowanie metodą dziel i zwyciężaj",
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(n)",
        available: true,
      },
      {
        id: "quick-sort",
        name: "Quick Sort",
        name_pl: "Sortowanie szybkie",
        shortName: "Quick",
        shortName_pl: "Szybkie",
        description: "In-place partitioning sort",
        description_pl: "Sortowanie z partycjonowaniem w miejscu",
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(log n)",
        available: true,
      },
      {
        id: "bubble-sort",
        name: "Bubble Sort",
        name_pl: "Sortowanie bąbelkowe",
        shortName: "Bubble",
        shortName_pl: "Bąbelkowe",
        description: "Simple comparison-based sort",
        description_pl: "Proste sortowanie oparte na porównaniach",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
        available: true,
      },
      {
        id: "heap-sort",
        name: "Heap Sort",
        name_pl: "Sortowanie przez kopcowanie",
        shortName: "Heap",
        shortName_pl: "Kopcowanie",
        description: "Binary heap based comparison sort",
        description_pl: "Sortowanie oparte na strukturze kopca",
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(1)",
        available: true,
      },
    ],
  },
  {
    id: "searching",
    label: "B — Searching",
    label_pl: "B — Wyszukiwanie",
    iconImage: "/images/categories/searching.png",
    color: "from-violet-500/20 to-purple-500/10",
    borderColor: "border-violet-500/30",
    glowColor: "shadow-violet-500/10",
    algorithms: [
      {
        id: "binary-search",
        name: "Binary Search",
        name_pl: "Wyszukiwanie binarne",
        shortName: "Binary",
        shortName_pl: "Binarne",
        description: "Efficient sorted-array search",
        description_pl: "Efektywne szukanie w posortowanej tablicy",
        timeComplexity: "O(log n)",
        spaceComplexity: "O(1)",
        available: true,
      },
      {
        id: "linear-search",
        name: "Linear Search",
        name_pl: "Wyszukiwanie liniowe",
        shortName: "Linear",
        shortName_pl: "Liniowe",
        description: "Sequential element-by-element scan",
        description_pl: "Sekwencyjne sprawdzanie każdego elementu",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        available: true,
      },
    ],
  },
  {
    id: "graphs",
    label: "C — Graphs",
    label_pl: "C — Grafy",
    iconImage: "/images/categories/graphs.png",
    color: "from-emerald-500/20 to-teal-500/10",
    borderColor: "border-emerald-500/30",
    glowColor: "shadow-emerald-500/10",
    algorithms: [
      {
        id: "dijkstra",
        name: "Dijkstra's Shortest Path",
        name_pl: "Algorytm Dijkstry",
        shortName: "Dijkstra",
        shortName_pl: "Dijkstra",
        description: "Single-source shortest path with priority queue",
        description_pl: "Najkrótsza ścieżka z jednego źródła",
        timeComplexity: "O((V+E) log V)",
        spaceComplexity: "O(V)",
        available: true,
      },
      {
        id: "kruskal",
        name: "Kruskal's MST",
        name_pl: "Algorytm Kruskala",
        shortName: "Kruskal",
        shortName_pl: "Kruskal",
        description: "Minimum spanning tree via edge sorting",
        description_pl: "Minimalne drzewo rozpinające przez krawędzie",
        timeComplexity: "O(E log E)",
        spaceComplexity: "O(V)",
        available: true,
      },
      {
        id: "bfs",
        name: "Breadth-First Search",
        name_pl: "Wyszukiwanie wszerz (BFS)",
        shortName: "BFS",
        shortName_pl: "BFS",
        description: "Level-order graph traversal",
        description_pl: "Przeszukiwanie grafu poziomami",
        timeComplexity: "O(V + E)",
        spaceComplexity: "O(V)",
        available: true,
      },
      {
        id: "dfs",
        name: "Depth-First Search",
        name_pl: "Wyszukiwanie w głąb (DFS)",
        shortName: "DFS",
        shortName_pl: "DFS",
        description: "Stack-based deep graph traversal",
        description_pl: "Przeszukiwanie grafu przez zagłębianie",
        timeComplexity: "O(V + E)",
        spaceComplexity: "O(V)",
        available: true,
      },
      {
        id: "prim",
        name: "Prim's MST",
        name_pl: "Algorytm Prima",
        shortName: "Prim",
        shortName_pl: "Prim",
        description: "Minimum spanning tree via vertex growth",
        description_pl: "Minimalne drzewo rozpinające przez wierzchołki",
        timeComplexity: "O((V+E) log V)",
        spaceComplexity: "O(V)",
        available: true,
      },
      {
        id: "topo-sort",
        name: "Topological Sort",
        name_pl: "Sortowanie topologiczne",
        shortName: "TopoSort",
        shortName_pl: "Sort. Topo.",
        description: "DAG linear ordering",
        description_pl: "Liniowe porządkowanie grafu skierowanego",
        timeComplexity: "O(V + E)",
        spaceComplexity: "O(V)",
        available: true,
      },
    ],
  },
  {
    id: "trees",
    label: "D — Trees",
    label_pl: "D — Drzewa",
    iconImage: "/images/categories/trees.png",
    color: "from-amber-500/20 to-orange-500/10",
    borderColor: "border-amber-500/30",
    glowColor: "shadow-amber-500/10",
    algorithms: [
      {
        id: "binary",
        name: "Binary Tree",
        name_pl: "Drzewo binarne",
        shortName: "Binary",
        shortName_pl: "Binarne",
        description: "Hierarchical node structure with up to two children",
        description_pl: "Struktura węzłów z maksymalnie dwojgiem dzieci",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        available: true,
      },
      {
        id: "bst",
        name: "Binary Search Tree",
        name_pl: "Binarne drzewo poszukiwań",
        shortName: "BST",
        shortName_pl: "BST",
        description: "Ordered insertion & search tree",
        description_pl: "Uporządkowane drzewo binarne do wyszukiwania",
        timeComplexity: "O(log n)",
        spaceComplexity: "O(n)",
        available: true,
      },
      {
        id: "avl",
        name: "AVL Tree",
        name_pl: "Drzewo AVL",
        shortName: "AVL",
        shortName_pl: "AVL",
        description: "Self-balancing BST with rotations",
        description_pl: "Samobalansujące się drzewo BST",
        timeComplexity: "O(log n)",
        spaceComplexity: "O(n)",
        available: true,
      },
      {
        id: "rbt",
        name: "Red-Black Tree",
        name_pl: "Drzewo czerwono-czarne",
        shortName: "RBT",
        shortName_pl: "RBT",
        description: "Self-balancing BST with node coloring",
        description_pl: "Samobalansujące się drzewo z kolorowaniem",
        timeComplexity: "O(log n)",
        spaceComplexity: "O(n)",
        available: true,
      },
      {
        id: "trie",
        name: "Trie Prefix Tree",
        name_pl: "Drzewo Trie (prefiksowe)",
        shortName: "Trie",
        shortName_pl: "Trie",
        description: "Prefix tree for search and autocomplete",
        description_pl: "Drzewo prefiksowe do autouzupełniania",
        timeComplexity: "O(L)",
        spaceComplexity: "O(AL)",
        available: true,
      },
      {
        id: "heap-sort-tree",
        name: "Heap Sort (Tree)",
        name_pl: "Heap Sort (drzewo)",
        shortName: "HeapSort",
        shortName_pl: "HeapSort",
        description:
          "Heap sort as a binary tree — build max-heap, then extract root and watch the tree shrink",
        description_pl:
          "Heap Sort jako drzewo — budowanie kopca, wyodrębnianie korzenia, drzewo się kurczy",
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(1)",
        available: true,
      },
    ],
  },
  {
    id: "dp",
    label: "E — Dynamic Programming",
    label_pl: "E — Programowanie Dynamiczne",
    iconImage: "/images/categories/dp.png",
    color: "from-rose-500/20 to-pink-500/10",
    borderColor: "border-rose-500/30",
    glowColor: "shadow-rose-500/10",
    algorithms: [
      {
        id: "knapsack",
        name: "0/1 Knapsack",
        name_pl: "Problem plecakowy 0/1",
        shortName: "Knapsack",
        shortName_pl: "Plecak",
        description: "Optimal value under weight constraint",
        description_pl: "Optymalizacja wartości przy limicie wagowym",
        timeComplexity: "O(nW)",
        spaceComplexity: "O(nW)",
        available: true,
      },
      {
        id: "lcs",
        name: "Longest Common Subsequence",
        name_pl: "Najdłuższy wspólny podciąg",
        shortName: "LCS",
        shortName_pl: "NWP",
        description: "Longest shared subsequence of two strings",
        description_pl: "Najdłuższy ciąg znaków wspólny dla dwóch tekstów",
        timeComplexity: "O(mn)",
        spaceComplexity: "O(mn)",
        available: true,
      },
    ],
  },
  {
    id: "grid",
    label: "F — Grid / Mazes",
    label_pl: "F — Siatka / Labirynty",
    iconImage: "/images/categories/grid.png",
    color: "from-indigo-500/20 to-blue-500/10",
    borderColor: "border-indigo-500/30",
    glowColor: "shadow-indigo-500/10",
    algorithms: [
      {
        id: "a-star",
        name: "A* Search",
        name_pl: "Algorytm A*",
        shortName: "A*",
        shortName_pl: "A*",
        description: "Heuristic best-first pathfinding",
        description_pl: "Heurystyczne wyszukiwanie najkrótszej ścieżki",
        timeComplexity: "O(E)",
        spaceComplexity: "O(V)",
        available: true,
      },
      {
        id: "flood-fill",
        name: "Flood Fill",
        name_pl: "Algorytm Flood Fill",
        shortName: "Flood",
        shortName_pl: "Wypełnianie",
        description: "Region-filling flood algorithm",
        description_pl: "Algorytm wypełniania spójnych obszarów",
        timeComplexity: "O(mn)",
        spaceComplexity: "O(mn)",
        available: true,
      },
    ],
  },
];

/** Flat lookup helpers */
export function findAlgorithm(categoryId: string, algoId: string) {
  const cat = ALGORITHM_CATALOG.find((c) => c.id === categoryId);
  if (!cat) return null;
  const algo = cat.algorithms.find((a) => a.id === algoId);
  return algo ? { category: cat, algorithm: algo } : null;
}

export function getAllAlgorithms() {
  return ALGORITHM_CATALOG.flatMap((cat) =>
    cat.algorithms.map((algo) => ({ category: cat, algorithm: algo })),
  );
}

/**
 * Looks up an algorithm by its full name (e.g., "Dijkstra's Path" or "Merge Sort")
 */
export function findAlgorithmByName(name: string) {
  const all = getAllAlgorithms();
  // Try exact match first
  let match = all.find(
    (a) => a.algorithm.name === name || a.algorithm.name_pl === name,
  );

  // Fallback for legacy snapshot names (e.g., "Dijkstra's Path" -> "Dijkstra's Shortest Path")
  if (!match) {
    if (name.includes("Dijkstra"))
      match = all.find((a) => a.algorithm.id === "dijkstra");
    else if (name.includes("Kruskal"))
      match = all.find((a) => a.algorithm.id === "kruskal");
    else
      match = all.find(
        (a) =>
          a.algorithm.name.includes(name) ||
          name.includes(a.algorithm.name) ||
          a.algorithm.name_pl?.includes(name),
      );
  }
  return match || null;
}
