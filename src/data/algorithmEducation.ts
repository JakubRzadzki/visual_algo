/**
 * Algorithm Education Data — Educational content for each algorithm.
 * Contains theory, analogies ("For Dummies"), and pseudocode.
 */

export interface AlgorithmEducation {
  theory: string;
  forDummies: string;
  pseudocode: string;
}

export const ALGORITHM_EDUCATION: Record<string, AlgorithmEducation> = {
  'merge-sort': {
    theory: 'Merge Sort is a divide-and-conquer algorithm that recursively splits the array into halves, sorts them, and merges them back together. It has a guaranteed O(n log n) time complexity.',
    forDummies: 'Imagine sorting a huge deck of cards. You split it between two friends, they split it again, until everyone has just one card. Then, pairs of friends merge their sorted piles back together until the whole deck is sorted.',
    pseudocode: `procedure mergeSort(A, p, r):
    if p < r:
        q = floor((p + r) / 2)
        mergeSort(A, p, q)
        mergeSort(A, q + 1, r)
        merge(A, p, q, r)`
  },
  'quick-sort': {
    theory: 'Quick Sort is a highly efficient sorting algorithm that uses a partitioning strategy. It picks a "pivot" element and reorders the array so that elements smaller than the pivot are on the left and larger ones are on the right.',
    forDummies: 'Think of a line of people of different heights. Pick one person as the "referee". Everyone shorter than the referee moves to their left, and everyone taller moves to their right. Now the referee is in their final spot. Repeat for the left and right groups!',
    pseudocode: `procedure quickSort(A, low, high):
    if low < high:
        p = partition(A, low, high)
        quickSort(A, low, p - 1)
        quickSort(A, p + 1, high)`
  },
  'bubble-sort': {
    theory: 'Bubble Sort is a simple comparison-based algorithm. It repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order.',
    forDummies: 'Imagine bubbles in a soda. The biggest bubbles are the lightest and they float to the top. In this algorithm, the largest numbers "bubble up" to the end of the array one by one.',
    pseudocode: `procedure bubbleSort(A):
    for i from 0 to n-1:
        for j from 0 to n-i-2:
            if A[j] > A[j+1]:
                swap(A[j], A[j+1])`
  },
  'dijkstra': {
    theory: "Dijkstra's algorithm finds the shortest path from a starting node to all other nodes in a weighted graph. It uses a greedy approach and a priority queue to always expand the closest known node.",
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
  'a-star': {
    theory: "A* (A-Star) is a popular pathfinding algorithm that extends Dijkstra's by using heuristics. It calculates f(n) = g(n) + h(n), where g is the cost from the start and h is the estimated cost to the goal.",
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
  }
};

/**
 * Helper to get education data for an algorithm ID.
 * Returns default data if the specific ID is not found.
 */
export function getAlgorithmEducation(id: string): AlgorithmEducation {
  return ALGORITHM_EDUCATION[id] || {
    theory: "Theory for this algorithm is coming soon.",
    forDummies: "A real-world analogy for this algorithm is coming soon.",
    pseudocode: "// Pseudocode coming soon"
  };
}
