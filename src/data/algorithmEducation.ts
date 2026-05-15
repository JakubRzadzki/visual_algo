/**
 * Algorithm Education Data — Educational content for each algorithm.
 * Contains theory, historical origins, analogies ("For Dummies"), and pseudocode.
 * Supports English and Polish languages.
 */

export interface AlgorithmEducation {
  /** Formal academic description. */
  theory: string;
  theory_pl: string;
  /** Historical context. */
  history: string;
  history_pl: string;
  /** Real-world analogy. */
  forDummies: string;
  forDummies_pl: string;
  /** High-level pseudocode (language-agnostic). */
  pseudocode: string;
}

export interface TranslatedEducation {
  theory: string;
  history: string;
  forDummies: string;
  pseudocode: string;
}

export const ALGORITHM_EDUCATION: Record<string, AlgorithmEducation> = {
  'merge-sort': {
    theory: "Merge Sort is a stable, divide-and-conquer sorting algorithm. It divides the array into halves, sorts them recursively, and merges the results.",
    theory_pl: 'Sortowanie przez scalanie (Merge Sort) to stabilny algorytm typu "dziel i zwyciężaj". Dzieli tablicę na połowy, sortuje je rekurencyjnie, a następnie scala wyniki.',
    history: "Invented by John von Neumann in 1945 as part of early computing research.",
    history_pl: 'Wynaleziony przez Johna von Neumanna w 1945 roku w ramach wczesnych badań nad komputeryzacją.',
    forDummies: "Sorting a deck of cards by splitting it into smaller and smaller piles, then combining them in order.",
    forDummies_pl: 'To jak sortowanie talii kart poprzez dzielenie jej na coraz mniejsze stosy, a następnie łączenie ich w odpowiedniej kolejności.',
    pseudocode: `procedure mergeSort(arr):
    if length > 1:
        left = mergeSort(firstHalf)
        right = mergeSort(secondHalf)
        return merge(left, right)`
  },
  'quick-sort': {
    theory: "Quick Sort is an efficient, comparison-based algorithm using a pivot element to partition the array.",
    theory_pl: 'Sortowanie szybkie (Quick Sort) to wydajny algorytm oparty na porównaniach, wykorzystujący element osiowy (pivot) do podziału tablicy.',
    history: "Developed by Tony Hoare in 1959 at Moscow State University.",
    history_pl: 'Opracowany przez Tony\'ego Hoare\'a w 1959 roku na Moskiewskim Uniwersytecie Państwowym.',
    forDummies: "Picking a leader in a crowd and making shorter people stand on the left and taller on the right.",
    forDummies_pl: 'Wybierasz "lidera" z tłumu. Niższe osoby stają po lewej stronie, a wyższe po prawej. Powtarzasz to dla obu grup.',
    pseudocode: `procedure quickSort(arr, low, high):
    if low < high:
        p = partition(arr, low, high)
        quickSort(arr, low, p-1)
        quickSort(arr, p+1, high)`
  },
  'bubble-sort': {
    theory: "Bubble Sort is a simple comparison algorithm that repeatedly steps through the list, swaps adjacent elements if they are in the wrong order.",
    theory_pl: 'Sortowanie bąbelkowe (Bubble Sort) to prosty algorytm, który wielokrotnie przechodzi przez listę, zamieniając sąsiednie elementy, jeśli są w złej kolejności.',
    history: "One of the oldest algorithms; documented by 1956 but possibly used earlier in mechanical sorting.",
    history_pl: 'Jeden z najstarszych algorytmów; udokumentowany w 1956 roku, ale prawdopodobnie używany wcześniej w sortowaniu mechanicznym.',
    forDummies: "Heavier bubbles in a carbonated drink sink to the bottom while lighter ones rise to the top.",
    forDummies_pl: 'Największe liczby "wypływają" na koniec tablicy jak bąbelki w napoju gazowanym.',
    pseudocode: `for i from 0 to n:
    for j from 0 to n-i-1:
        if arr[j] > arr[j+1]: swap(j, j+1)`
  },
  'heap-sort': {
    theory: "Heap Sort uses a binary heap data structure to find the maximum element and move it to the end of the array.",
    theory_pl: 'Sortowanie przez kopcowanie (Heap Sort) wykorzystuje strukturę kopca binarnego do znajdowania największego elementu i przenoszenia go na koniec tablicy.',
    history: "Proposed by J. W. J. Williams in 1964, who also described the heap data structure.",
    history_pl: 'Zaproponowany przez J. W. J. Williamsa w 1964 roku, który opisał również samą strukturę kopca.',
    forDummies: "Organizing people into a pyramid where the oldest is always at the top, then taking them away one by one.",
    forDummies_pl: 'Układasz ludzi w piramidę, gdzie najstarszy jest na szczycie. Zabierasz szefa, a piramidę układasz od nowa z pozostałych osób.',
    pseudocode: `procedure heapSort(arr):
    buildMaxHeap(arr)
    for i from n-1 to 1:
        swap(arr[0], arr[i])
        heapify(arr, 0, i)`
  },
  'binary-search': {
    theory: "Binary Search efficiently finds a target value within a sorted array by repeatedly halving the search interval.",
    theory_pl: 'Wyszukiwanie binarne (Binary Search) efektywnie znajduje wartość w posortowanej tablicy poprzez wielokrotne dzielenie przedziału poszukiwań na pół.',
    history: "A very old concept; binary search on a sorted list was first formally described by John Mauchly in 1946.",
    history_pl: 'Bardzo stara koncepcja; wyszukiwanie binarne na posortowanej liście zostało po raz pierwszy opisane przez Johna Mauchly\'ego w 1946 roku.',
    forDummies: "Opening a dictionary in the middle to find a word—deciding if the word is in the left or right half.",
    forDummies_pl: 'Szukasz słowa w papierowym słowniku. Otwierasz na środku i decydujesz: "moje słowo jest wcześniej czy później?". Połówkę, która Cię nie interesuje, odrzucasz.',
    pseudocode: `while low <= high:
    mid = (low + high) / 2
    if arr[mid] == target: return mid
    else if arr[mid] < target: low = mid + 1
    else: high = mid - 1`
  },
  'linear-search': {
    theory: "Linear Search checks every element of the list sequentially until the target is found or the list ends.",
    theory_pl: 'Wyszukiwanie liniowe (Linear Search) sprawdza każdy element listy po kolei, aż znajdzie cel lub dojdzie do końca listy.',
    history: "The most basic search method, used since the dawn of manual record keeping.",
    history_pl: 'Najprostsza metoda wyszukiwania, używana od początków prowadzenia rejestrów.',
    forDummies: "Looking for a specific sock in a messy pile by checking every single sock one by one.",
    forDummies_pl: 'Szukasz konkretnej skarpetki w stercie prania, sprawdzając każdą po kolei, dopóki nie znajdziesz tej właściwej.',
    pseudocode: `for i from 0 to n-1:
    if arr[i] == target: return i
return -1`
  },
  'dijkstra': {
    theory: "Dijkstra's algorithm finds the shortest path between nodes in a weighted graph with non-negative edge weights.",
    theory_pl: 'Algorytm Dijkstry znajduje najkrótszą ścieżkę między węzłami w grafie ważonym o nieujemnych wagach krawędzi.',
    history: "Conceived by computer scientist Edsger W. Dijkstra in 1956 and published in 1959.",
    history_pl: 'Opracowany przez informatyka Edsgera W. Dijkstrę w 1956 roku i opublikowany w 1959.',
    forDummies: "Finding the fastest driving route between two cities by exploring all possible roads systematically.",
    forDummies_pl: 'Szukasz najszybszej drogi do celu. Sprawdzasz wszystkie możliwe skrzyżowania, zaczynając od tych położonych najbliżej Ciebie.',
    pseudocode: `while priority_queue is not empty:
    u = priority_queue.pop()
    for neighbor v of u:
        relax(u, v, weight)`
  },
  'bfs': {
    theory: "Breadth-First Search (BFS) explores all neighbors of a node before moving to the next level of neighbors.",
    theory_pl: 'Przeszukiwanie wszerz (BFS) odwiedza wszystkich sąsiadów danego węzła, zanim przejdzie do kolejnego poziomu.',
    history: "Invented by Konrad Zuse in 1945 (unpublished) and independently by E. F. Moore in 1959.",
    history_pl: 'Wynaleziony przez Konrada Zuse w 1945 r. i niezależnie przez E. F. Moore\'a w 1959 r.',
    forDummies: "A rumor spreading in a small town—everyone tells all their friends, then those friends tell all their friends.",
    forDummies_pl: 'To jak fala rozchodząca się po wodzie. Najpierw sprawdzasz wszystko, co jest tuż obok, a potem idziesz coraz dalej.',
    pseudocode: `queue.push(root)
while queue:
    u = queue.pop()
    for v in neighbors(u): queue.push(v)`
  },
  'dfs': {
    theory: "Depth-First Search (DFS) explores as far as possible along each branch before backtracking.",
    theory_pl: 'Przeszukiwanie w głąb (DFS) idzie tak daleko, jak to możliwe wzdłuż każdej gałęzi, zanim zacznie się cofać.',
    history: "A version was investigated by French mathematician Charles Pierre Trémaux in the 19th century.",
    history_pl: 'Wersja tego algorytmu była badana przez francuskiego matematyka Charlesa Pierre\'a Trémaux już w XIX wieku.',
    forDummies: "Exploring a maze by following one path until you hit a wall, then turning back to the last split.",
    forDummies_pl: 'Idziesz przez labirynt tak długo, aż uderzysz w ścianę, a potem wracasz do ostatniego rozwidlenia i sprawdzasz inną drogę.',
    pseudocode: `procedure DFS(u):
    visit(u)
    for v in neighbors(u): DFS(v)`
  },
  'a-star': {
    theory: "A* Search is a pathfinding algorithm that uses heuristics to guide the search towards the goal more efficiently.",
    theory_pl: 'Algorytm A* to metoda wyszukiwania ścieżki, która używa heurystyki (inteligentnego zgadywania), aby szybciej dotrzeć do celu.',
    history: "Developed at Stanford Research Institute in 1968 by Hart, Nilsson, and Raphael.",
    history_pl: 'Opracowany w Stanford Research Institute w 1968 roku przez Harta, Nilssona i Raphaela.',
    forDummies: "Using a compass to always head generally toward the destination while avoiding obstacles.",
    forDummies_pl: 'To jak szukanie drogi z kompasem. Nie sprawdzasz wszystkiego na oślep, tylko idziesz tam, gdzie wydaje się, że jest najbliżej do celu.',
    pseudocode: `f(n) = g(n) + h(n)
while openList:
    n = best node in openList
    expand(n)`
  },
  'kruskal': {
    theory: "Kruskal's algorithm finds the Minimum Spanning Tree by sorting all edges and adding them if they don't form a cycle.",
    theory_pl: 'Algorytm Kruskala znajduje Minimalne Drzewo Rozpinające, sortując wszystkie krawędzie i dodając te najtańsze, które nie tworzą cyklu.',
    history: "First published by Joseph Kruskal in 1956.",
    history_pl: 'Po raz pierwszy opublikowany przez Josepha Kruskala w 1956 roku.',
    forDummies: "Connecting a group of islands with the cheapest possible bridges without creating unnecessary loops.",
    forDummies_pl: 'Chcesz połączyć wyspy mostami jak najtaniej. Wybierasz najtańsze możliwe połączenia, uważając, by nie budować mostów tam, gdzie już można dojechać inną drogą.',
    pseudocode: `sort edges by weight
for edge(u, v):
    if find(u) != find(v): union(u, v)`
  },
  'prim': {
    theory: "Prim's algorithm finds the Minimum Spanning Tree by growing a single tree from an arbitrary starting node.",
    theory_pl: 'Algorytm Prima znajduje Minimalne Drzewo Rozpinające, "rozrastając" jedno drzewo od wybranego wierzchołka startowego.',
    history: "Developed in 1930 by Jarník and later independently by Prim (1957) and Dijkstra (1959).",
    history_pl: 'Opracowany w 1930 roku przez Jarníka, a później niezależnie przez Prima (1957) i Dijkstrę (1959).',
    forDummies: "Building a power grid starting from one house and always adding the closest neighbor to the network.",
    forDummies_pl: 'Budujesz sieć energetyczną. Zaczynasz od jednego domu i zawsze podłączasz ten, który jest najbliżej już istniejącej sieci.',
    pseudocode: `while nodes_not_in_mst:
    u = min_edge_to_mst()
    add u to mst`
  },
  'topo-sort': {
    theory: "Topological Sort linearly orders vertices of a directed acyclic graph (DAG) based on their dependencies.",
    theory_pl: 'Sortowanie topologiczne to liniowe układanie wierzchołków grafu skierowanego bez cykli (DAG) zgodnie z ich zależnościami.',
    history: "First described by Kahn in 1962 and later implemented using DFS by Tarjan.",
    history_pl: 'Po raz pierwszy opisane przez Kahna w 1962 roku; później zaimplementowane przy użyciu DFS przez Tarjana.',
    forDummies: "Creating a to-do list where some tasks must be finished before others can start (like getting dressed).",
    forDummies_pl: 'To jak robienie listy zadań, gdzie niektóre rzeczy muszą być zrobione przed innymi (np. musisz założyć skarpetki przed butami).',
    pseudocode: `for each node:
    if not visited: DFS_visit(node)
push to stack after visiting neighbors`
  },
  'binary': {
    theory: "A Binary Tree is a tree where each node has at most two children, referred to as the left and right child.",
    theory_pl: 'Drzewo binarne to struktura danych, w której każdy węzeł ma co najwyżej dwoje dzieci: lewe i prawe.',
    history: "Fundamental to CS; the concept evolved with early linked list implementations in the 1950s.",
    history_pl: 'Podstawa informatyki; koncepcja ewoluowała wraz z wczesnymi implementacjami list powiązanych w latach 50.',
    forDummies: "A family tree where every couple has exactly zero, one, or two children.",
    forDummies_pl: 'To drzewo genealogiczne, w którym każda osoba może mieć maksymalnie dwoje dzieci.',
    pseudocode: `node = { value, left, right }`
  },
  'bst': {
    theory: "A Binary Search Tree (BST) maintains sorted data, with smaller values in the left subtree and larger in the right.",
    theory_pl: 'Binarne drzewo poszukiwań (BST) przechowuje dane w porządku: mniejsze wartości idą na lewo, większe na prawo.',
    history: "Independent development by researchers like Windley and Booth in the 1960s.",
    history_pl: 'Opracowane niezależnie przez badaczy takich jak Windley i Booth w latach 60.',
    forDummies: "A filing cabinet where everything to the left is smaller and everything to the right is bigger.",
    forDummies_pl: 'To szafka z dokumentami. Jeśli szukasz numeru 50, a na środku jest 100, wiesz, że musisz szukać tylko po lewej stronie.',
    pseudocode: `if val < node.val: insert(left)
else: insert(right)`
  },
  'avl': {
    theory: "An AVL Tree is a self-balancing BST where the heights of subtrees differ by at most one.",
    theory_pl: 'Drzewo AVL to samobalansujące się drzewo BST, w którym różnica wysokości poddrzew wynosi maksymalnie jeden.',
    history: "Named after Adelson-Velsky and Landis, who published it in 1962.",
    history_pl: 'Nazwa pochodzi od nazwisk Adelson-Velsky i Landis, którzy opublikowali algorytm w 1962 roku.',
    forDummies: "A balanced mobile that automatically adjusts itself so it doesn't tilt too far to one side.",
    forDummies_pl: 'To drzewo, które samo dba o to, by nie być zbyt "krzywym". Jeśli jedna strona robi się za długa, drzewo wykonuje "obrót", żeby się wyrównać.',
    pseudocode: `if balanceFactor > 1: rotate()`
  },
  'rbt': {
    theory: "A Red-Black Tree is a self-balancing BST that uses an extra bit per node to ensure the tree remains approximately balanced.",
    theory_pl: 'Drzewo czerwono-czarne to samobalansujące się drzewo BST, które używa "kolorów" węzłów, aby utrzymać równowagę.',
    history: "Invented by Rudolf Bayer in 1972 (as symmetric binary B-trees); named 'Red-Black' by Guibas and Sedgewick in 1978.",
    history_pl: 'Wynalezione przez Rudolfa Bayera w 1972 roku; nazwane "czerwono-czarnym" przez Guibasa i Sedgewicka w 1978.',
    forDummies: "A traffic light system for a tree to prevent any one path from getting twice as long as any other.",
    forDummies_pl: 'To drzewo z regułami jak w sygnalizacji świetlnej. Kolory pomagają pilnować, żeby żadna ścieżka nie była zbyt długa.',
    pseudocode: `recolor and rotate to maintain RBT properties`
  },
  'trie': {
    theory: "A Trie (Prefix Tree) is an ordered tree used to store a dynamic set of strings, where keys are usually strings.",
    theory_pl: 'Drzewo Trie (prefiksowe) to struktura służąca do przechowywania tekstów, gdzie wspólne początki słów (prefiksy) są współdzielone.',
    history: "First described by René de la Briandais in 1959; the term 'Trie' was coined by Edward Fredkin in 1960.",
    history_pl: 'Opisane po raz pierwszy przez René de la Briandais w 1959 r.; termin "Trie" wprowadził Edward Fredkin w 1960 r.',
    forDummies: "Follow a path of letters to build words—like finding a word in a dictionary letter by letter.",
    forDummies_pl: 'To jak autouzupełnianie w telefonie. Słowa są ułożone literka po literce na gałęziach. Żeby znaleźć "KOT", idziesz gałęzią K, potem O, potem T.',
    pseudocode: `procedure insert(word):
    for char in word: node = node.child(char)`
  },
  'knapsack': {
    theory: "The 0/1 Knapsack problem finds the highest value of items that fit in a weight limit using dynamic programming.",
    theory_pl: 'Problem plecakowy 0/1 znajduje najwyższą wartość przedmiotów mieszczących się w limicie wagowym przy użyciu programowania dynamicznego.',
    history: "Formally pioneered by George Dantzig; solved using DP by Richard Bellman in the 1950s.",
    history_pl: 'Sformalizowany przez George\'a Dantziga; rozwiązany przy użyciu programowania dynamicznego przez Richarda Bellmana w latach 50.',
    forDummies: "A burglar choosing the most expensive items to put in a bag without exceeding the weight limit.",
    forDummies_pl: 'Jesteś włamywaczem z torbą o limicie 20 kg. Musisz zdecydować, co zabrać, aby łup był jak najdroższy, nie rozrywając przy tym torby.',
    pseudocode: `dp[i][w] = max(val[i] + dp[i-1][w-wt[i]], dp[i-1][w])`
  },
  'lcs': {
    theory: "Longest Common Subsequence (LCS) finds the longest sequence present in two strings in the same relative order.",
    theory_pl: 'Najdłuższy wspólny podciąg (LCS) znajduje najdłuższy ciąg znaków występujący w obu tekstach w tej samej względnej kolejności.',
    history: "Published in 1974 by Wagner and Fischer for string correction and foundational to the 'diff' utility.",
    history_pl: 'Opublikowany w 1974 roku przez Wagnera i Fischera na potrzeby korekty tekstów; fundament działania narzędzia "diff".',
    forDummies: "Finding the longest shared list of favorite movies between two friends' collections.",
    forDummies_pl: 'Porównujesz listy filmów z kolegą i sprawdzasz, jaka jest najdłuższa seria tytułów, która pojawia się w obu listach w tej samej kolejności.',
    pseudocode: `if X[i] == Y[j]: dp[i][j] = dp[i-1][j-1] + 1`
  },
  'flood-fill': {
    theory: "Flood Fill determines connected areas in a grid, used for bucket-fill tools in graphics editors.",
    theory_pl: 'Algorytm Flood Fill wyznacza spójne obszary w siatce; używany w narzędziach typu "wiadro z farbą" w edytorach graficznych.',
    history: "Derived from graph traversals; became famous through early digital painting software in the 1970s.",
    history_pl: 'Wywodzi się z przeszukiwania grafów; stał się sławny dzięki wczesnym programom do malowania cyfrowego w latach 70.',
    forDummies: "Spilling paint on a canvas and watching it fill a closed shape until it hits a border.",
    forDummies_pl: 'To jak rozlanie farby w programie Paint. Klikasz w jedno miejsce, a farba rozlewa się, dopóki nie napotka granicy innego koloru.',
    pseudocode: `procedure floodFill(node): if color == target: fill(node); floodFill(neighbors)`
  },
  'max-heap': {
    theory: "A Max Heap is a tree where every parent is greater than or equal to its children, ensuring the max is at the root.",
    theory_pl: 'Kopiec typu Max to drzewo, w którym każdy rodzic jest większy lub równy swoim dzieciom, co gwarantuje, że maksimum jest w korzeniu.',
    history: "Incented by Williams in 1964 as part of the Heap Sort algorithm for efficient priority management.",
    history_pl: 'Wynaleziony przez Williamsa w 1964 roku jako część algorytmu sortowania przez kopcowanie.',
    forDummies: "A corporate ladder where the boss is always at the top and every manager is above their subordinates.",
    forDummies_pl: 'To drabina korporacyjna. Szef jest na samej górze, a każdy kierownik jest "ważniejszy" od swoich bezpośrednich podwładnych.',
    pseudocode: `while child > parent: swap(child, parent)`
  },
  'union-find': {
    theory: "Union-Find tracks disjoint sets and supports near-constant time merging and membership checks.",
    theory_pl: 'Struktura zbiorów rozłącznych (Union-Find) śledzi grupy elementów i pozwala na ich błyskawiczne łączenie oraz sprawdzanie przynależności.',
    history: "First described by Galler and Fischer in 1964; famous for its incredibly efficient path compression.",
    history_pl: 'Opisana przez Gallera i Fischera w 1964 roku; znana z niesamowicie wydajnej optymalizacji (kompresja ścieżek).',
    forDummies: "Tracking friendship circles at a party and quickly checking if two people belong to the same group.",
    forDummies_pl: 'To śledzenie grup znajomych na imprezie. Możesz błyskawicznie sprawdzić, czy dwie osoby należą do tej samej paczki.',
    pseudocode: `procedure find(i): return root of i; procedure union(i, j): join roots`
  }
};

/**
 * Helper to get education data for an algorithm ID.
 */
export function getAlgorithmEducation(id: string, lang: 'en' | 'pl' = 'en'): TranslatedEducation {
  const data = ALGORITHM_EDUCATION[id];
  if (!data) return {
    theory: lang === 'en' ? "Coming soon" : "Wkrótce dostępne",
    history: lang === 'en' ? "Coming soon" : "Wkrótce dostępne",
    forDummies: lang === 'en' ? "Coming soon" : "Wkrótce dostępne",
    pseudocode: "// Coming soon"
  };

  return {
    theory: lang === 'en' ? data.theory : data.theory_pl,
    history: lang === 'en' ? data.history : data.history_pl,
    forDummies: lang === 'en' ? data.forDummies : data.forDummies_pl,
    pseudocode: data.pseudocode
  };
}
