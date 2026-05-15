/**
 * Algorithm Education Data — Educational content for each algorithm.
 * Contains theory, historical origins, analogies ("For Dummies"), and pseudocode.
 */

export interface AlgorithmEducation {
  /** Formal academic description of the algorithm's mechanics. */
  theory: string;
  /** Historical context: inventors, year of creation, and original purpose. */
  history: string;
  /** Real-world analogy to simplify complex concepts. */
  forDummies: string;
  /** High-level pseudocode representation. */
  pseudocode: string;
}

export const ALGORITHM_EDUCATION: Record<string, AlgorithmEducation> = {
  'merge-sort': {
    theory: 'Merge Sort is a stable, comparison-based sorting algorithm that uses a divide-and-conquer strategy. It recursively divides the input into two halves, sorts them, and merges the sorted halves back together.',
    history: 'Invented by John von Neumann in 1945. It was developed while he was working on early computer systems like the EDVAC, aiming for a highly efficient method to handle large-scale data processing that simplified hardware requirements.',
    forDummies: 'Imagine sorting a huge deck of cards. You split it between two friends, they split it again, until everyone has just one card. Then, pairs of friends merge their sorted piles back together until the whole deck is sorted.',
    pseudocode: `procedure mergeSort(A, p, r):
    if p < r:
        q = floor((p + r) / 2)
        mergeSort(A, p, q)
        mergeSort(A, q + 1, r)
        merge(A, p, q, r)`
  },
  'quick-sort': {
    theory: 'Quick Sort is a divide-and-conquer algorithm that selects a "pivot" element and partitions the array into two sub-arrays: elements smaller than the pivot and elements larger than the pivot. These sub-arrays are then sorted recursively.',
    history: 'Developed by British computer scientist Tony Hoare in 1959 while he was a visiting student at Moscow State University. He needed a fast way to sort words alphabetically for a Russian-to-English translation project.',
    forDummies: 'Think of a line of people of different heights. Pick one person as the "referee". Everyone shorter than the referee moves to their left, and everyone taller moves to their right. Now the referee is in their final spot. Repeat for the left and right groups!',
    pseudocode: `procedure quickSort(A, low, high):
    if low < high:
        p = partition(A, low, high)
        quickSort(A, low, p - 1)
        quickSort(A, p + 1, high)`
  },
  'bubble-sort': {
    theory: 'Bubble Sort is a simple comparison-based algorithm that repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. This pass is repeated until the list is sorted.',
    history: 'First described in 1956 by Edward Harry Friend as a "sorting exchange algorithm." It was later popularized and given its evocative name by Kenneth E. Iverson in his work on APL programming language.',
    forDummies: 'Imagine bubbles in a soda. The biggest bubbles are the lightest and they float to the top. In this algorithm, the largest numbers "bubble up" to the end of the array one by one.',
    pseudocode: `procedure bubbleSort(A):
    for i from 0 to n-1:
        for j from 0 to n-i-2:
            if A[j] > A[j+1]:
                swap(A[j], A[j+1])`
  },
  'heap-sort': {
    theory: "Heap Sort is a comparison-based sorting technique based on a Binary Heap data structure. It is similar to selection sort where we first find the maximum element and place the maximum element at the end. We repeat the same process for the remaining elements.",
    history: "Invented by J. W. J. Williams in 1964, who also described the heap data structure. Robert W. Floyd later refined it in the same year with an in-place version of the algorithm.",
    forDummies: "Imagine building a pyramid of blocks where the largest block must always be at the top. You take the top block, put it in your 'sorted' pile, and rearrange the pyramid so the next largest block moves to the top. Repeat until all blocks are sorted!",
    pseudocode: `procedure heapSort(A):
    buildMaxHeap(A)
    for i from n-1 down to 1:
        swap(A[0], A[i])
        maxHeapify(A, 0, i)`
  },
  'binary-search': {
    theory: 'Binary search is an efficient algorithm for finding an item from a sorted list of items. It works by repeatedly dividing in half the portion of the list that could contain the item, until you\'ve narrowed down the possible locations to just one.',
    history: 'The concept was first formally mentioned by John Mauchly in 1946. However, it took until 1960 for Derrick Henry Lehmer to publish an implementation that worked correctly for arrays of any size, as early versions often failed on specific edge cases.',
    forDummies: 'Imagine finding a name in a physical phone book. You open it to the exact middle. If the name is alphabetically later, you ignore the first half and repeat the process with the second half. You reach your target in just a few flips!',
    pseudocode: `procedure binarySearch(A, target):
    low = 0, high = n-1
    while low <= high:
        mid = floor((low + high) / 2)
        if A[mid] == target: return mid
        if A[mid] < target: low = mid + 1
        else: high = mid - 1`
  },
  'linear-search': {
    theory: "Linear search is a very simple search algorithm. In this type of search, a sequential search is made over all items one by one. Every item is checked and if a match is found then that particular item is returned, otherwise the search continues till the end of the data collection.",
    history: "The most basic form of searching, dating back to antiquity. It is the intuitive way humans search through unordered lists. Its formalization in computer science happened in the earliest days of electronic computing as the simplest baseline for search performance.",
    forDummies: "Imagine you're looking for your keys in a row of pockets. You check the first one, then the second, then the third... until you either find them or you've checked every single pocket.",
    pseudocode: `procedure linearSearch(A, target):
    for each element x in A:
        if x == target: return index`
  },
  'dijkstra': {
    theory: "Dijkstra's algorithm finds the shortest path between nodes in a graph. It uses a greedy approach, maintaining a set of 'visited' nodes and their current minimum distance from the source.",
    history: "Invented by Edsger W. Dijkstra in 1956 and published in 1959. He famously designed it in about 20 minutes while sitting at a café in Amsterdam with his fiancée, wanting to demonstrate the power of the new ARMAC computer.",
    forDummies: "Imagine you're trying to find the fastest way to get to different cities. You start at home and look at all the nearest cities. You always pick the closest one you haven't visited yet, and update the travel times to its neighbors. Keep doing this until you've mapped out the quickest routes to everywhere!",
    pseudocode: `procedure dijkstra(G, start):
    dist[start] = 0
    pq.push(start, 0)
    while pq is not empty:
        u = pq.pop()
        for each neighbor v of u:
            newDist = dist[u] + weight(u, v)
            if newDist < dist[v]:
                dist[v] = newDist
                pq.push(v, newDist)`
  },
  'kruskal': {
    theory: "Kruskal's algorithm is a greedy algorithm that finds a Minimum Spanning Tree (MST) for a weighted undirected graph. it finds a subset of the edges that forms a tree that includes every vertex, where the total weight of all the edges in the tree is minimized.",
    history: "Published by Joseph Kruskal in 1956. He developed it as a simple, direct way to solve the MST problem, which was becoming increasingly important for designing efficient power and communication networks.",
    forDummies: "Imagine you're connecting a series of islands with the cheapest possible bridges. You list all possible bridges from cheapest to most expensive. You build each bridge in order, but only if it doesn't create a loop between islands already connected!",
    pseudocode: `procedure kruskal(G):
    sort edges by weight
    for each edge (u, v):
        if find(u) != find(v):
            add (u, v) to MST
            union(u, v)`
  },
  'prim': {
    theory: "Prim's algorithm finds the Minimum Spanning Tree by starting from an arbitrary node and repeatedly adding the cheapest edge that connects a node in the tree to a node outside of it.",
    history: "Originally discovered by Czech mathematician Vojtěch Jarník in 1930. It was later independently rediscovered and published by Robert C. Prim in 1957, and again by Edsger Dijkstra in 1959.",
    forDummies: "Imagine building a network of cables starting from a single office. You look at all the buildings you could connect to next. You always pick the closest building that isn't yet connected. Your network grows like a tree until everyone is linked!",
    pseudocode: `procedure prim(G, start):
    MST = {start}
    while MST does not include all vertices:
        find cheapest edge (u, v) where u in MST, v not in MST
        add v to MST`
  },
  'bfs': {
    theory: "Breadth-First Search (BFS) is a graph traversal algorithm that explores all neighbor nodes at the current depth before moving to the next level. it uses a queue to keep track of nodes to visit.",
    history: "Invented by Konrad Zuse in 1945 for his Z3 computer (published in 1972). It was later independently rediscovered by Edward F. Moore in 1959 for finding the shortest path through mazes.",
    forDummies: "Imagine you're looking for someone in a large building. You check every room on the first floor first. Only after you've checked them all do you move to the second floor. You explore layer by layer!",
    pseudocode: `procedure BFS(G, root):
    Q.enqueue(root)
    while Q is not empty:
        v = Q.dequeue()
        for each neighbor w of v:
            if w is not visited:
                Q.enqueue(w)`
  },
  'dfs': {
    theory: "Depth-First Search (DFS) is a graph traversal algorithm that explores as far as possible along each branch before backtracking. It uses a stack or recursion to manage the traversal.",
    history: "A version was first investigated in the 19th century by French mathematician Charles Pierre Trémaux as a strategy for solving mazes. It was formalized for computer science by John Hopcroft and Robert Tarjan in the 1970s.",
    forDummies: "Imagine you're exploring a cave system. You pick a tunnel and keep going deeper and deeper until you hit a dead end. Then you backtrack just far enough to find a new tunnel you haven't tried yet. You go deep before you go wide!",
    pseudocode: `procedure DFS(v):
    visited[v] = true
    for each neighbor w of v:
        if w is not visited:
            DFS(w)`
  },
  'topo-sort': {
    theory: "Topological Sort for a Directed Acyclic Graph (DAG) is a linear ordering of vertices such that for every directed edge uv, vertex u comes before v in the ordering.",
    history: "First described by Arthur Kahn in 1962. It is widely used in scheduling problems and build systems (like Make or Gradle) to determine the order of task execution based on dependencies.",
    forDummies: "Imagine getting dressed in the morning. You have to put on your socks before your shoes, and your shirt before your jacket. Topological sort helps you find the right order to do everything so you never break any of those 'before' rules!",
    pseudocode: `procedure topoSort(G):
    L = Empty list
    S = Nodes with no incoming edges
    while S is not empty:
        remove n from S, add to L
        for each neighbor m of n:
            remove edge (n, m)
            if m has no other incoming edges: add m to S`
  },
  'binary': {
    theory: "A Binary Tree is a hierarchical data structure in which each node has at most two children, referred to as the left child and the right child.",
    history: "The concept of binary trees dates back to the work of early mathematicians like Gottfried Wilhelm Leibniz in the 17th century. In computer science, they were formalized in the 1950s for efficient data storage and retrieval.",
    forDummies: "Think of a family tree where every person can have a maximum of two children. It starts with one 'root' person at the top and branches downwards.",
    pseudocode: `struct Node:
    data, left, right`
  },
  'bst': {
    theory: "A Binary Search Tree (BST) is a binary tree where for each node, the left subtree contains only nodes with keys lesser than the node's key, and the right subtree contains only nodes with keys greater than the node's key.",
    history: "Invented in 1960 by several researchers independently, including P.F. Windley, A.D. Booth, and A.J. Colin. It became the foundation for many complex data structures used in databases and file systems.",
    forDummies: "Imagine a library shelf. You pick a book in the middle. Everything to its left comes earlier in the alphabet, and everything to its right comes later. This makes finding a specific book incredibly fast!",
    pseudocode: `procedure insert(node, key):
    if key < node.key:
        if node.left: insert(node.left, key)
        else: node.left = new Node(key)
    else: ...`
  },
  'avl': {
    theory: "An AVL tree (named after inventors Adelson-Velsky and Landis) is a self-balancing binary search tree. In an AVL tree, the heights of the two child subtrees of any node differ by at most one.",
    history: "The first self-balancing binary search tree, invented in 1962 by Georgy Adelson-Velsky and Evgenii Landis. It was a major breakthrough in ensuring O(log n) performance for dynamic data sets.",
    forDummies: "Imagine a balance scale that automatically moves weights around. If one side gets too heavy, the scale 'rotates' the weights to make sure both sides stay perfectly level and balanced.",
    pseudocode: `procedure rotate(node):
    // Perform tree rotations to restore balance`
  },
  'rbt': {
    theory: "A Red-Black Tree is a kind of self-balancing binary search tree. Each node stores an extra bit for 'color' (red or black), used to ensure that the tree remains approximately balanced during insertions and deletions.",
    history: "Originally invented in 1972 by Rudolf Bayer, who called them 'symmetric binary B-trees.' The name 'Red-Black Tree' was coined by Leo J. Guibas and Robert Sedgewick in 1978.",
    forDummies: "Think of a map with specific rules about colors. By making sure no path has too many red nodes in a row, the tree guarantees it will never get too lopsided, keeping search times fast and predictable.",
    pseudocode: `procedure fixViolation(node):
    // Recolor and rotate to maintain RBT properties`
  },
  'trie': {
    theory: "A Trie (from 'retrieval') is an ordered tree data structure used to store a dynamic set or associative array where the keys are usually strings.",
    history: "First described by René de la Briandais in 1959. The term 'Trie' was coined shortly after by Edward Fredkin, who pronounced it 'tree' (though many now say 'try' to distinguish it).",
    forDummies: "Imagine a dictionary where you find words by following a path of letters. To find 'CAT', you go to 'C', then follow the 'O' branch, then the 'T' branch. It's how your phone's autocomplete works so fast!",
    pseudocode: `procedure insert(word):
    current = root
    for char in word:
        current = current.children[char]`
  },
  'knapsack': {
    theory: "The 0/1 Knapsack problem is a combinatorial optimization problem. Given a set of items, each with a weight and a value, determine the items to include in a collection so that the total weight is less than or equal to a given limit and the total value is as large as possible.",
    history: "The term 'knapsack' has been used for over a century, but the formal optimization problem was pioneered by George Dantzig in the mid-20th century. Richard Bellman later applied dynamic programming to solve the 0/1 version efficiently in the 1950s.",
    forDummies: "Imagine you're a burglar with a bag that can only hold 20kg. You see a gold bar, a heavy TV, and a diamond. You have to decide which combination of items gives you the most money without breaking your bag!",
    pseudocode: `procedure knapsack(W, weights, values):
    dp[n+1][W+1]
    for i from 1 to n:
        for w from 1 to W:
            if weights[i] <= w:
                dp[i][w] = max(values[i] + dp[i-1][w-weights[i]], dp[i-1][w])
            else:
                dp[i][w] = dp[i-1][w]`
  },
  'lcs': {
    theory: "The Longest Common Subsequence (LCS) problem is finding the longest subsequence common to all sequences in a set of sequences (usually two). Unlike substrings, subsequences are not required to occupy consecutive positions.",
    history: "The standard dynamic programming approach was published by Robert A. Wagner and Michael J. Fischer in 1974. It was created to solve the 'string-to-string correction problem,' foundational for tools like the Unix 'diff' utility.",
    forDummies: "Imagine you and a friend both have a favorite list of movies. You want to see which movies appear in both lists in the same relative order. You don't care if there are other movies in between, just the longest shared sequence!",
    pseudocode: `procedure LCS(X, Y):
    m = length(X), n = length(Y)
    for i from 1 to m:
        for j from 1 to n:
            if X[i] == Y[j]: dp[i][j] = dp[i-1][j-1] + 1
            else: dp[i][j] = max(dp[i-1][j], dp[i][j-1])`
  },
  'a-star': {
    theory: "A* Search extends Dijkstra's by incorporating heuristics. It uses the function f(n) = g(n) + h(n), where g(n) is the actual cost from start and h(n) is the heuristic estimate to the goal.",
    history: "Developed by Peter Hart, Nils Nilsson, and Bertram Raphael in 1968 at the Stanford Research Institute. It was created as the navigation brain for 'Shakey the Robot,' the first mobile robot with reasoning capabilities.",
    forDummies: "Imagine you're lost in a forest trying to get to a lighthouse. Dijkstra would walk in every direction equally. A* is smarter—it looks at how far it's walked *and* keeps an eye on the lighthouse, prioritizing paths that seem to lead directly towards it.",
    pseudocode: `procedure AStar(start, goal):
    openSet = {start}
    gScore[start] = 0
    fScore[start] = heuristic(start, goal)
    while openSet is not empty:
        current = node in openSet with lowest fScore
        if current == goal: return reconstructPath()
        for each neighbor:
            tentative_gScore = gScore[current] + d(current, neighbor)
            if tentative_gScore < gScore[neighbor]:
                gScore[neighbor] = tentative_gScore
                fScore[neighbor] = gScore[neighbor] + h(neighbor, goal)
                openSet.add(neighbor)`
  },
  'flood-fill': {
    theory: "Flood fill is an algorithm that determines the area connected to a given node in a multi-dimensional array. It is used in the 'bucket' fill tool of paint programs to fill connected, similarly-colored areas with a different color.",
    history: "Derived from graph traversal algorithms like BFS and DFS. It became widely known through early computer graphics and the development of the first digital painting software in the late 1970s.",
    forDummies: "Imagine you spill a bucket of blue paint on a white tiled floor. The paint flows into every white tile it can reach, but stops as soon as it hits a wall or a tile that was already painted red.",
    pseudocode: `procedure floodFill(x, y, targetColor, replacementColor):
    if color(x, y) == targetColor:
        color(x, y) = replacementColor
        floodFill(x+1, y, ...)
        floodFill(x-1, y, ...)`
  },
  'max-heap': {
    theory: "A Max Heap is a specialized tree-based data structure that satisfies the heap property: in a max heap, for any given node I, the value of I is greater than or equal to the values of its children.",
    history: "The heap data structure was invented by J. W. J. Williams in 1964 for the heap sort algorithm. It has since become a standard way to implement priority queues.",
    forDummies: "Think of a competitive leaderboard. The person at the very top is the absolute best. Every person on the level below is slightly worse than their boss above them, and so on down the line.",
    pseudocode: `procedure heapifyUp(index):
    while A[index] > A[parent(index)]:
        swap(A[index], A[parent(index)])`
  },
  'union-find': {
    theory: "A Union-Find data structure (also called a Disjoint-Set Union) keeps track of elements which are split into one or more disjoint sets. It supports two main operations: Find (find which set an element belongs to) and Union (join two sets into one).",
    history: "The concept was first described by Bernard A. Galler and Michael J. Fischer in 1964. It is famous for its nearly-constant time complexity when using optimizations like path compression.",
    forDummies: "Imagine tracking different groups of friends at a party. Union-find lets you quickly check if two people belong to the same circle, or 'union' two different circles into one big group when people start talking to each other.",
    pseudocode: `procedure find(i):
    if parent[i] == i: return i
    return parent[i] = find(parent[i])`
  }
};

/**
 * Helper to get education data for an algorithm ID.
 * Returns default data if the specific ID is not found.
 */
export function getAlgorithmEducation(id: string): AlgorithmEducation {
  return ALGORITHM_EDUCATION[id] || {
    theory: "Theory for this algorithm is coming soon.",
    history: "Historical context is being researched.",
    forDummies: "A real-world analogy for this algorithm is coming soon.",
    pseudocode: "// Pseudocode coming soon"
  };
}
