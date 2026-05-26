/**
 * @file translationHelper.ts
 * @description Translates sorting step descriptions from English to Polish on the fly.
 */

export function translateSortingDescription(desc: string, language: "en" | "pl"): string {
  if (language !== "pl") return desc;

  // Starting messages
  if (desc.startsWith("Starting ")) {
    const algo = desc.replace("Starting ", "");
    const mapped: Record<string, string> = {
      "Bubble Sort": "Sortowanie bąbelkowe",
      "Heap Sort": "Sortowanie przez kopcowanie",
      "Merge Sort": "Sortowanie przez scalanie",
      "Quick Sort": "Sortowanie szybkie",
    };
    return `Rozpoczynanie: ${mapped[algo] || algo}`;
  }

  // Completion messages
  if (desc.endsWith(" Sort complete!")) {
    const algo = desc.replace(" complete!", "");
    const mapped: Record<string, string> = {
      "Bubble Sort": "Sortowanie bąbelkowe",
      "Heap Sort": "Sortowanie przez kopcowanie",
      "Merge Sort": "Sortowanie przez scalanie",
      "Quick Sort": "Sortowanie szybkie",
    };
    return `${mapped[algo] || algo} zakończone!`;
  }

  // Common patterns
  // 1. Comparing arr[j]=X and arr[j+1]=Y (Bubble Sort comparison)
  let match = desc.match(/^Comparing arr\[(\d+)\]=(\d+) and arr\[(\d+)\]=(\d+)$/);
  if (match) {
    return `Porównywanie arr[${match[1]}]=${match[2]} oraz arr[${match[3]}]=${match[4]}`;
  }

  // 2. Swapping arr[i]=X ↔ arr[largest]=Y
  match = desc.match(/^Swapping arr\[(\d+)\]=(\d+) ↔ arr\[(\d+)\]=(\d+)$/);
  if (match) {
    return `Zamiana arr[${match[1]}]=${match[2]} ↔ arr[${match[3]}]=${match[4]}`;
  }

  // 3. Swapped → arr[i]=X, arr[j]=Y
  match = desc.match(/^Swapped → arr\[(\d+)\]=(\d+), arr\[(\d+)\]=(\d+)$/);
  if (match) {
    return `Zamieniono → arr[${match[1]}]=${match[2]}, arr[${match[3]}]=${match[4]}`;
  }

  // 4. Swapping X ↔ Y
  match = desc.match(/^Swapping (\d+) ↔ (\d+)$/);
  if (match) {
    return `Zamiana ${match[1]} ↔ ${match[2]}`;
  }

  // 5. Pass X complete — element Y is in place
  match = desc.match(/^Pass (\d+) complete — element (\d+) is in place$/);
  if (match) {
    return `Krok ${match[1]} zakończony — element ${match[2]} jest na swoim miejscu`;
  }

  // 6. Array is already sorted — early exit
  if (desc === "Array is already sorted — early exit") {
    return "Tablica jest już posortowana — wcześniejsze wyjście";
  }

  // 7. Merging subarrays [lo..mid] and [mid+1..hi]
  match = desc.match(/^Merging subarrays \[(\d+)\.\.(\d+)\] and \[(\d+)\.\.(\d+)\]$/);
  if (match) {
    return `Scalanie podtablic [${match[1]}..${match[2]}] oraz [${match[3]}..${match[4]}]`;
  }

  // 8. Comparing X and Y
  match = desc.match(/^Comparing (\d+) and (\d+)$/);
  if (match) {
    return `Porównywanie ${match[1]} oraz ${match[2]}`;
  }

  // 9. Placing remaining X at index Y
  match = desc.match(/^Placing remaining (\d+) at index (\d+)$/);
  if (match) {
    return `Umieszczanie pozostałego elementu ${match[1]} pod indeksem ${match[2]}`;
  }

  // 10. Placing X at index Y
  match = desc.match(/^Placing (\d+) at index (\d+)$/);
  if (match) {
    return `Umieszczanie elementu ${match[1]} pod indeksem ${match[2]}`;
  }

  // 11. Pivot selected: arr[hi]=X
  match = desc.match(/^Pivot selected: arr\[(\d+)\]=(\d+)$/);
  if (match) {
    return `Wybrany pivot: arr[${match[1]}]=${match[2]}`;
  }

  // 12. Comparing arr[j]=X with pivot Y
  match = desc.match(/^Comparing arr\[(\d+)\]=(\d+) with pivot (\d+)$/);
  if (match) {
    return `Porównywanie elementu arr[${match[1]}]=${match[2]} z pivotem ${match[3]}`;
  }

  // 13. Placing pivot: swap arr[pivotPos]=X ↔ arr[hi]=Y
  match = desc.match(/^Placing pivot: swap arr\[(\d+)\]=(\d+) ↔ arr\[(\d+)\]=(\d+)$/);
  if (match) {
    return `Umieszczanie pivota: zamiana arr[${match[1]}]=${match[2]} ↔ arr[${match[3]}]=${match[4]}`;
  }

  // 14. Pivot X placed at index Y
  match = desc.match(/^Pivot (\d+) placed at index (\d+)$/);
  if (match) {
    return `Pivot ${match[1]} umieszczony pod indeksem ${match[2]}`;
  }

  // 15. Phase 1: Building max-heap
  if (desc === "Phase 1: Building max-heap") {
    return "Faza 1: Budowanie kopca maksymalnego (max-heap)";
  }

  // 16. Max-heap built successfully
  if (desc === "Max-heap built successfully") {
    return "Kopiec maksymalny zbudowany pomyślnie";
  }

  // 17. Phase 2: Extracting sorted elements
  if (desc === "Phase 2: Extracting sorted elements") {
    return "Faza 2: Wyciąganie posortowanych elementów";
  }

  // 18. Moving max X to position Y
  match = desc.match(/^Moving max (\d+) to position (\d+)$/);
  if (match) {
    return `Przenoszenie elementu maksymalnego ${match[1]} na pozycję ${match[2]}`;
  }

  // 19. Element X placed at final position Y
  match = desc.match(/^Element (\d+) placed at final position (\d+)$/);
  if (match) {
    return `Element ${match[1]} umieszczony na ostatecznej pozycji ${match[2]}`;
  }

  // 20. Comparing arr[largest]=X with left child arr[left]=Y
  match = desc.match(/^Comparing arr\[(\d+)\]=(\d+) with left child arr\[(\d+)\]=(\d+)$/);
  if (match) {
    return `Porównywanie arr[${match[1]}]=${match[2]} z lewym dzieckiem arr[${match[3]}]=${match[4]}`;
  }

  // 21. Comparing arr[largest]=X with right child arr[right]=Y
  match = desc.match(/^Comparing arr\[(\d+)\]=(\d+) with right child arr\[(\d+)\]=(\d+)$/);
  if (match) {
    return `Porównywanie arr[${match[1]}]=${match[2]} z prawym dzieckiem arr[${match[3]}]=${match[4]}`;
  }

  return desc;
}

/**
 * Translates graph algorithm system log messages from English to Polish on the fly.
 */
export function translateGraphDescription(desc: string, language: "en" | "pl"): string {
  if (language !== "pl" || !desc) return desc;

  // Initializations
  if (desc.startsWith("Dijkstra initialized")) {
    return desc.replace("Dijkstra initialized from start node", "Algorytm Dijkstry zainicjowany z wierzchołka startowego");
  }
  if (desc.startsWith("BFS initialized")) {
    return desc.replace("BFS initialized from start node", "BFS zainicjowany z wierzchołka startowego");
  }
  if (desc.startsWith("DFS initialized")) {
    return desc.replace("DFS initialized from start node", "DFS zainicjowany z wierzchołka startowego");
  }
  if (desc.startsWith("Kruskal's algorithm initialized")) {
    return "Algorytm Kruskala został zainicjowany";
  }
  if (desc.startsWith("Prim's algorithm initialized")) {
    return "Algorytm Prima został zainicjowany";
  }
  if (desc.startsWith("Kahn's Topological Sort initialized")) {
    return "Sortowanie topologiczne Kahna zostało zainicjowane";
  }

  // Node visiting
  let match = desc.match(/^Visiting node (\w+)(?: with current distance (\d+|∞))?$/);
  if (match) {
    const distText = match[2] ? ` (z dystansem ${match[2]})` : "";
    return `Odwiedzanie wierzchołka ${match[1]}${distText}`;
  }

  // Visiting node in BFS/DFS
  match = desc.match(/^Visiting node (\w+)$/);
  if (match) {
    return `Odwiedzanie wierzchołka ${match[1]}`;
  }

  // Edge relaxing
  match = desc.match(/^Relaxing edge (\w+)\s*->\s*(\w+)\s*\(weight:\s*(\d+)\)$/);
  if (match) {
    return `Relaksacja krawędzi ${match[1]} -> ${match[2]} (waga: ${match[3]})`;
  }
  match = desc.match(/^Edge (\w+)\s*->\s*(\w+)\s*relaxed\s*\(new distance:\s*(\d+)\)$/);
  if (match) {
    return `Krawędź ${match[1]} -> ${match[2]} zrelaksowana (nowy dystans: ${match[3]})`;
  }
  match = desc.match(/^Edge (\w+)\s*->\s*(\w+)\s*not relaxed\s*\((\d+)\s*\+\s*(\d+)\s*>=\s*(\d+|∞)\)$/);
  if (match) {
    return `Krawędź ${match[1]} -> ${match[2]} nie ulega relaksacji (${match[3]} + ${match[4]} >= ${match[5]})`;
  }

  // MST Edges
  match = desc.match(/^Selected edge (\w+)\s*->\s*(\w+)\s*\(weight\s*(\d+)\)\s*connecting component (\d+) and (\d+)$/);
  if (match) {
    return `Wybrano krawędź ${match[1]} -> ${match[2]} (waga: ${match[3]}) łączącą komponenty ${match[4]} i ${match[5]}`;
  }
  match = desc.match(/^Skipping edge (\w+)\s*->\s*(\w+)\s*because it creates a cycle$/);
  if (match) {
    return `Pominięto krawędź ${match[1]} -> ${match[2]}, ponieważ tworzy cykl`;
  }
  match = desc.match(/^Kruskal's MST complete\.\s*Total weight:\s*(\d+)$/);
  if (match) {
    return `Minimalne drzewo rozpinające Kruskala zakończone. Łączna waga: ${match[1]}`;
  }

  // Prim's
  match = desc.match(/^Connecting node (\w+) to MST via edge with weight (\d+)$/);
  if (match) {
    return `Dołączanie wierzchołka ${match[1]} do MST krawędzią o wadze ${match[2]}`;
  }
  match = desc.match(/^Prim's MST complete\.\s*Total weight:\s*(\d+)$/);
  if (match) {
    return `Minimalne drzewo rozpinające Prima zakończone. Łączna waga: ${match[1]}`;
  }

  // Topological sort
  match = desc.match(/^Adding node (\w+) to topological order$/);
  if (match) {
    return `Dodawanie wierzchołka ${match[1]} do porządku topologicznego`;
  }
  match = desc.match(/^Decreasing in-degree of (\w+) due to edge (\w+)\s*->\s*(\w+)$/);
  if (match) {
    return `Zmniejszanie stopnia wejściowego ${match[1]} z powodu krawędzi ${match[2]} -> ${match[3]}`;
  }
  match = desc.match(/^Topological sort complete!$/);
  if (match) {
    return "Sortowanie topologiczne zakończone!";
  }
  match = desc.match(/^Cycle detected! Graph is not a DAG\.$/);
  if (match) {
    return "Wykryto cykl! Graf nie jest skierowanym grafem acyklicznym (DAG).";
  }

  // --- Tree algorithms translations ---
  if (desc === "Starting AVL Tree construction.") return "Rozpoczynanie budowy drzewa AVL.";
  if (desc === "Starting RBT construction.") return "Rozpoczynanie budowy drzewa czerwono-czarnego (RBT).";
  if (desc === "Starting Trie construction.") return "Rozpoczynanie budowy drzewa Trie.";
  if (desc === "Starting Binary Search Tree construction.") return "Rozpoczynanie budowy binarnego drzewa poszukiwań (BST).";
  if (desc === "Starting Binary Tree Traversals demonstration.") return "Rozpoczynanie demonstracji przechodzenia drzewa binarnego.";
  if (desc === "BST construction complete.") return "Budowa drzewa BST zakończona.";
  if (desc === "All tree traversals completed successfully.") return "Wszystkie przechodzenia drzewa zakończone pomyślnie.";

  // Traversals
  if (desc === "--- Starting Pre-order Traversal (Root -> Left -> Right) ---") {
    return "--- Rozpoczynanie przechodzenia Pre-order (Korzeń -> Lewo -> Prawo) ---";
  }
  if (desc === "--- Starting In-order Traversal (Left -> Root -> Right) ---") {
    return "--- Rozpoczynanie przechodzenia In-order (Lewo -> Korzeń -> Prawo) ---";
  }
  if (desc === "--- Starting Post-order Traversal (Left -> Right -> Root) ---") {
    return "--- Rozpoczynanie przechodzenia Post-order (Lewo -> Prawo -> Korzeń) ---";
  }

  match = desc.match(/^Pre-order: Visiting Node \(([^)]+)\)$/);
  if (match) return `Pre-order: Odwiedzanie węzła (${match[1]})`;
  match = desc.match(/^In-order: Visiting Node \(([^)]+)\)$/);
  if (match) return `In-order: Odwiedzanie węzła (${match[1]})`;
  match = desc.match(/^Post-order: Visiting Node \(([^)]+)\)$/);
  if (match) return `Post-order: Odwiedzanie węzła (${match[1]})`;

  // Inserting words in Trie
  match = desc.match(/^Inserting word: "([^"]+)"$/);
  if (match) return `Wstawianie słowa: "${match[1]}"`;
  match = desc.match(/^Word "([^"]+)" inserted completely\.$/);
  if (match) return `Słowo "${match[1]}" zostało pomyślnie wstawione.`;

  // Inserting and going directions in BST/AVL/RBT
  match = desc.match(/^Inserting (\d+)$/);
  if (match) return `Wstawianie elementu ${match[1]}`;
  match = desc.match(/^(\d+) < (\d+), going left\.$/);
  if (match) return `${match[1]} < ${match[2]}, idziemy w lewo.`;
  match = desc.match(/^(\d+) >= (\d+), going right\.$/);
  if (match) return `${match[1]} >= ${match[2]}, idziemy w prawo.`;

  // Rotations and Recoloring in AVL/RBT
  match = desc.match(/^Left Rotation on (\d+)$/);
  if (match) return `Rotacja w lewo (Left) na elemencie ${match[1]}`;
  match = desc.match(/^Right Rotation on (\d+)$/);
  if (match) return `Rotacja w prawo (Right) na elemencie ${match[1]}`;
  match = desc.match(/^Left-Right Rotation starting on (\d+)$/);
  if (match) return `Rotacja lewo-prawo (Left-Right) rozpoczynająca się na elemencie ${match[1]}`;
  match = desc.match(/^Right-Left Rotation starting on (\d+)$/);
  if (match) return `Rotacja prawo-lewo (Right-Left) rozpoczynająca się na elemencie ${match[1]}`;
  match = desc.match(/^Left rotate on (\d+)$/);
  if (match) return `Rotacja w lewo (Left) na elemencie ${match[1]}`;
  match = desc.match(/^Right rotate on (\d+)$/);
  if (match) return `Rotacja w prawo (Right) na elemencie ${match[1]}`;
  match = desc.match(/^Recoloring (\d+), (\d+) and (\d+)$/);
  if (match) return `Przemalowywanie elementów ${match[1]}, ${match[2]} oraz ${match[3]}`;

  // Generic/fallback translations
  return desc
    .replace("Visiting node", "Odwiedzanie wierzchołka")
    .replace("relaxed", "zrelaksowano")
    .replace("not relaxed", "nie ulega relaksacji")
    .replace("initialized", "zainicjowany")
    .replace("complete", "zakończone")
    .replace("Selected MST edge", "Wybrana krawędź MST")
    .replace("Total weight:", "Łączna waga:")
    .replace("Queue", "Kolejka")
    .replace("Stack", "Stos");
}

