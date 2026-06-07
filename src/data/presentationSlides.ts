/**
 * @file presentationSlides.ts
 * @description Slide deck content for the EDVR engineering presentation.
 *
 * Technical, implementation-first deck: every architecture slide is backed by a
 * real source snippet from this repository, labelled with its file path. The
 * content focuses on concrete engineering trade-offs (Virtual DOM overhead,
 * GIL/Event-Loop limits, container isolation, RAF scheduling, O(...) costs).
 */

/** Languages supported by the slide code blocks (mapped to Prism grammars). */
export type SlideCodeLanguage =
  | "typescript"
  | "go"
  | "markup"
  | "css"
  | "python"
  | "cpp";

/** A syntax-highlighted code block attached to a slide. */
export interface SlideCode {
  /** Prism language id used for highlighting. */
  language: SlideCodeLanguage;
  /** Repository path shown (bold) directly above the snippet. */
  filePath: string;
  /** The raw source code to display. */
  code: string;
  /** Optional one-line caption shown beneath the snippet (e.g. complexity). */
  caption?: string;
}

/** Visual layout variant used to render a slide. */
export type SlideVariant = "title" | "content" | "table" | "closing";

/** A single presentation slide. */
export interface PresentationSlide {
  id: number;
  variant: SlideVariant;
  kicker?: string;
  title: string;
  subtitle?: string;
  bullets?: string[];
  flow?: string[];
  table?: { headers: string[]; rows: string[][] };
  code?: SlideCode;
  /** Speaker note rendered in a subtle panel. */
  note?: string;
  authors?: string[];
  repo?: string;
  /** Compact complexity badge text (algorithm slides). */
  complexity?: string;
  /** Route to the live in-app visualization (algorithm slides only). */
  route?: string;
  /** Catalog category id of the live visualization (drives playback). */
  categoryId?: string;
}

export const PRESENTATION_SLIDES: PresentationSlide[] = [
  // ── 1. Title ──────────────────────────────────────────────
  {
    id: 1,
    variant: "title",
    kicker: "PREZENTACJA TECHNICZNA",
    title: "EDVR — Algorithm Visualizer Engine",
    subtitle:
      "Execution-Driven Visual Rendering · full-stack · Go + Docker + React/SVG",
    authors: ["Jakub Rządzki", "Krystian Piechota"],
    repo: "github.com/JakubRzadzki/visual_algo",
  },

  // ── 2. Problem ───────────────────────────────────────────
  {
    id: 2,
    variant: "content",
    kicker: "Problem",
    title: "Czego nie widać w debuggerze",
    bullets: [
      "Debugger pokazuje jeden stan pamięci na breakpoincie — nie pokazuje przejść między nimi.",
      "Dynamika struktur (rotacje AVL, relaksacja krawędzi, sift-down w kopcu) jest niewidoczna.",
      "Gotowe wizualizatory rysują animacje ręcznie — nie są sprzężone z wykonaniem realnego kodu.",
    ],
    note: "Cel: pokazać każdą operację na strukturze danych jako produkt wykonania prawdziwego kodu (C++/Python), a nie wcześniej nagraną animację.",
  },

  // ── 3. Koncepcja EDVR ────────────────────────────────────
  {
    id: 3,
    variant: "content",
    kicker: "Koncepcja",
    title: "EDVR: kod → ślad → animacja",
    bullets: [
      "Kod użytkownika kompilowany/interpretowany w izolacji (Docker).",
      "Program wypisuje strukturalny ślad wykonania jako linie JSON (Execution Trace).",
      "Frontend parsuje ślad i odtwarza go zdarzeniowo na natywnej scenie SVG.",
      "Silnik jest niezależny od algorytmu — nowy algorytm = nowa wtyczka.",
    ],
    code: {
      language: "typescript",
      filePath: "src/types.ts",
      code: `export interface ExecutionTrace {
  events: VisualizationEvent[];     // deterministyczna sekwencja kroków
  metadata: TraceMetadata;          // złożoność, liczba węzłów, czas
}`,
    },
    note: "ExecutionTrace to kontrakt między backendem/workerem a warstwą renderującą. Determinizm umożliwia scrubbing i odtwarzanie wstecz.",
  },

  // ── 4. Zakres ────────────────────────────────────────────
  {
    id: 4,
    variant: "table",
    kicker: "Zakres",
    title: "Baza algorytmów — 6 kategorii, 20+ wtyczek",
    table: {
      headers: [
        "Sortowanie",
        "Przeszukiwanie",
        "Grafy",
        "Drzewa",
        "Dynamiczne",
        "Pathfinding",
      ],
      rows: [
        ["Bubble Sort", "Linear Search", "BFS", "BST", "0/1 Knapsack", "A*"],
        ["Merge Sort", "Binary Search", "DFS", "AVL", "LCS", "Flood Fill"],
        ["Quick Sort", "", "Dijkstra", "Red-Black", "", ""],
        ["Heap Sort", "", "Kruskal, Prim", "Przechodzenie", "", ""],
        ["", "", "Topological Sort", "Trie", "", ""],
      ],
    },
    note: "Każdy algorytm to osobna klasa implementująca AlgorithmPlugin. Rejestr w workerze mapuje id → instancję — dodanie algorytmu nie dotyka silnika.",
  },

  // ── 5. Przepływ danych ───────────────────────────────────
  {
    id: 5,
    variant: "content",
    kicker: "Architektura",
    title: "Przepływ: edytor → Go → Docker → ślad → SVG",
    flow: [
      "Monaco",
      "POST /api/run (Go/Gin)",
      "Docker sandbox",
      "JSON na stdout",
      "parser",
      "scena SVG",
    ],
    code: {
      language: "typescript",
      filePath: "src/services/sandboxApi.ts",
      code: `export async function executeInSandbox(
  code: string,
  language: string,
): Promise<RunResponse> {
  const res = await fetch("/api/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, language }),
  });
  return res.json() as Promise<RunResponse>; // { trace, output, error }
}`,
    },
    note: "Frontend nie kompiluje kodu — deleguje to do backendu i otrzymuje surowy ślad. Brak sieci w przeglądarce ≠ brak wykonania: jest fallback na lokalny worker.",
  },

  // ── 6. Backend Go / Gin ──────────────────────────────────
  {
    id: 6,
    variant: "content",
    kicker: "Backend",
    title: "Go + Gin: współbieżność bez narzutu wątków OS",
    bullets: [
      "Node.js: jednowątkowy Event Loop — wiele równoległych kontenerów blokuje pętlę.",
      "Python: GIL wymusza wieloprocesowość dla realnej równoległości.",
      "Go: goroutine ~2 KB na stos, scheduler M:N, router Gin oparty na Radix Tree.",
    ],
    code: {
      language: "go",
      filePath: "backend/main.go",
      code: `func main() {
    initDB()
    r := gin.Default()
    r.Use(cors.New(corsConfig))

    r.POST("/api/snapshots", createSnapshot)
    r.GET("/api/snapshots/:id", getSnapshot)
    r.POST("/api/run", executeCode) // wykonanie w sandboxie

    r.Run(":" + port)
}`,
    },
    note: "Routing Radix Tree daje dopasowanie ścieżki w O(długość ścieżki). Każde żądanie /api/run obsługiwane jest w osobnej goroutine — tysiące współbieżnych sandboxów bez puli wątków systemowych.",
  },

  // ── 7. Docker isolation ──────────────────────────────────
  {
    id: 7,
    variant: "content",
    kicker: "Bezpieczeństwo",
    title: "Izolacja kontenera: namespaces + cgroups + watchdog",
    bullets: [
      "NetworkDisabled — brak sieci, brak eksfiltracji danych.",
      "cgroups: 256 MB RAM, 0.5 rdzenia CPU (NanoCPUs).",
      "Watchdog 10 s → przekroczenie czasu kończy kontener (HTTP 408).",
    ],
    code: {
      language: "go",
      filePath: "backend/main.go",
      code: `resp, err := cli.ContainerCreate(ctx, &container.Config{
    Image:           imageName,
    Cmd:             cmd,
    NetworkDisabled: true,                  // izolacja sieci
}, &container.HostConfig{
    Resources: container.Resources{
        Memory:   256 * 1024 * 1024,        // 256 MB
        NanoCPUs: 500000000,                // 0.5 CPU
    },
}, nil, nil, "")

select {
case <-statusCh:                            // zakończono
case <-time.After(10 * time.Second):        // watchdog
    c.JSON(408, gin.H{"error": "timed out (10s)"})
}`,
    },
    note: "Limity są egzekwowane przez jądro (cgroups), nie przez kod aplikacji. Kontener nie ma dostępu do hosta ani sieci — kod użytkownika działa w pełni odseparowany.",
  },

  // ── 8. Zustand ───────────────────────────────────────────
  {
    id: 8,
    variant: "content",
    kicker: "Frontend",
    title: "Stan globalny: Zustand zamiast Reduxa",
    bullets: [
      "Redux: dużo boilerplate, częste akcje generują presję na GC.",
      "Zustand: subskrypcje selektorowe — komponent renderuje się tylko gdy zmieni się wybrane pole.",
    ],
    code: {
      language: "typescript",
      filePath: "src/store/uiStore.ts",
      code: `export const useUIStore = create<UIState>((set) => ({
  animationSpeed: 1.0,
  activeMode: "sorting",
  isAnimating: false,
  setAnimationSpeed: (speed) => set({ animationSpeed: speed }),
  setIsAnimating: (v) => set({ isAnimating: v }),
}));

// selektor: render tylko gdy zmieni się dokładnie to pole
const speed = useUIStore((s) => s.animationSpeed);`,
    },
    note: "Selektor zawęża subskrypcję do jednego pola, eliminując kaskadowe przerysowania całego drzewa przy każdej zmianie stanu.",
  },

  // ── 9. Nie Cytoscape ─────────────────────────────────────
  {
    id: 9,
    variant: "content",
    kicker: "Trade-off",
    title: "Dlaczego nie Cytoscape.js",
    bullets: [
      "Cytoscape renderuje na <canvas> — elementy nie istnieją w DOM.",
      "Brak DOM = brak filtrów CSS (backdrop-blur, glow) per element.",
      "Motyw glassmorphism wymaga natywnego SVG z filtrami SVG/CSS.",
    ],
    note: "Canvas wygrywa przy dziesiątkach tysięcy elementów; my potrzebowaliśmy efektów wizualnych per-węzeł i pełnej kontroli nad rendererem — stąd własna scena SVG.",
  },

  // ── 10. Nie D3 ───────────────────────────────────────────
  {
    id: 10,
    variant: "content",
    kicker: "Trade-off",
    title: "Dlaczego nie D3.js",
    bullets: [
      "D3 imperatywnie mutuje DOM (d3.select) — React zarządza tym samym DOM deklaratywnie.",
      "Dwa źródła prawdy nad jednym drzewem = konflikty i wycieki pamięci.",
      "Przy 100+ zdarzeniach/s reconciliacja gubi klatki.",
    ],
    note: "Zamiast łączyć D3 z Reactem, scena SVG jest deklaratywna (Framer Motion), a aktualizacje wysokiej częstotliwości idą obok Reacta przez EventBus.",
  },

  // ── 11. Strategy / plugin ────────────────────────────────
  {
    id: 11,
    variant: "content",
    kicker: "Wzorzec",
    title: "Strategy: jeden kontrakt, N algorytmów",
    bullets: [
      "Każdy algorytm implementuje ten sam interfejs i zwraca ExecutionTrace.",
      "Silnik renderujący nie wie nic o konkretnym algorytmie.",
    ],
    code: {
      language: "typescript",
      filePath: "src/types.ts",
      code: `export interface AlgorithmPlugin<InputShape = unknown> {
  id: string;        // 'merge-sort'
  name: string;      // 'Merge Sort'
  category: "sorting" | "searching" | "graph" | "tree" | "dp" | "grid";
  execute(data: InputShape): ExecutionTrace;
}`,
    },
    note: "Dodanie algorytmu = jedna klasa + wpis w rejestrze workera. Zero zmian w silniku animacji czy w scenie SVG.",
  },

  // ── 12. Discriminated union ──────────────────────────────
  {
    id: 12,
    variant: "content",
    kicker: "Type safety",
    title: "Zdarzenia jako dyskryminowana unia",
    bullets: [
      "Pole `type` jednoznacznie identyfikuje kształt payloadu.",
      "switch po `type` jest wyczerpujący — kompilator wymusza obsługę każdego wariantu.",
    ],
    code: {
      language: "typescript",
      filePath: "src/types.ts",
      code: `export type EventPayload =
  | { type: "ARRAY_SWAP"; indices: [number, number]; values: [number, number] }
  | { type: "GRAPH_RELAX"; edgeId: string; weight: number }
  | { type: "TREE_ROTATE"; pivotId: string; direction: "LEFT" | "RIGHT" }
  | { type: "MATRIX_CELL_HIGHLIGHT"; row: number; col: number; color?: string }
  | { type: "ARRAY_SET"; index: number; value: number; previousValue?: number };
  // ... 20+ wariantów`,
    },
    note: "Niemożliwe jest odczytanie pola, którego dany wariant nie posiada — błędy kształtu payloadu znikają na etapie kompilacji, a nie w runtime.",
  },

  // ── Architektura klas ──────────────────────────────
  {
    id: 13,
    variant: "table",
    kicker: "Architektura klas",
    title: "Mapa klas — przegląd warstw",
    subtitle: "43 klasy w czterech warstwach systemu",
    table: {
      headers: ["Warstwa", "Co zawiera", "Liczba"],
      rows: [
        ["Rdzeń silnika (TypeScript)", "Silnik animacji, magistrala zdarzeń, pula wątków", "3"],
        ["Wtyczki algorytmów (TypeScript)", "Klasy implementujące kontrakt AlgorithmPlugin<T>", "23"],
        ["Węzły struktur (TypeScript, lokalne)", "Węzły drzew budowane wewnątrz wtyczek", "4"],
        ["Backend (Go — struct)", "Model danych i kontrakty API", "3"],
        ["Implementacje referencyjne (Python)", "Struktury danych uruchamiane w sandboxie", "10"],
        ["RAZEM", "—", "43"],
      ],
    },
    note: "We froncie klasami są tylko 3 elementy rdzenia i 23 wtyczki — reszta warstwy TypeScript to typy, interfejsy i komponenty funkcyjne. Go używa struct (odpowiednik klasy), a Python tworzy drugą, niezależną rodzinę klas struktur.",
  },
  {
    id: 14,
    variant: "table",
    kicker: "Architektura klas · rdzeń",
    title: "Rdzeń silnika (TypeScript)",
    table: {
      headers: ["Klasa", "Odpowiedzialność", "Plik"],
      rows: [
        ["AnimationEngine", "Pętla requestAnimationFrame: odtwarza ślad klatka po klatce, steruje play/pause/seek i prędkością, planuje animacje; watchdog ubija zbyt długie generowanie śladu", "core/AnimationEngine.ts"],
        ["AnimationEventBus", "Broker pub-sub: rozsyła zdarzenia wizualizacji do scen z pominięciem cyklu renderowania Reacta", "core/EventBus.ts"],
        ["WorkerPool", "Pula Web Workerów z kolejką FIFO: zleca parsowanie śladu i layout grafu poza wątek UI, utrzymując 60 FPS", "core/WorkerPool.ts"],
      ],
    },
    note: "Trzy jedyne stanowe klasy warstwy frontu. To one realizują kluczowe decyzje wydajnościowe: animacja poza Reactem i obliczenia poza głównym wątkiem.",
  },
  {
    id: 15,
    variant: "table",
    kicker: "Architektura klas · węzły",
    title: "Węzły struktur danych (TypeScript, lokalne)",
    table: {
      headers: ["Klasa", "Odpowiedzialność", "Plik"],
      rows: [
        ["TreeNode", "Węzeł drzewa BST: klucz oraz wskaźniki na lewe i prawe dziecko", "core/plugins/trees/BSTPlugin.ts"],
        ["AVLNode", "Węzeł drzewa AVL: klucz, dzieci i wysokość używana do wyliczania współczynnika balansu", "core/plugins/trees/AVLTreePlugin.ts"],
        ["RBTNode", "Węzeł drzewa czerwono-czarnego: klucz, dzieci, rodzic i kolor (czerwony/czarny)", "core/plugins/trees/RBTPlugin.ts"],
        ["TrieNode", "Węzeł drzewa trie: mapa dzieci indeksowana znakami i flaga końca słowa", "core/plugins/trees/TriePlugin.ts"],
      ],
    },
    note: "Klasy lokalne — zdefiniowane wewnątrz metody budującej strukturę w danej wtyczce, dlatego nie są eksportowane.",
  },
  {
    id: 16,
    variant: "table",
    kicker: "Architektura klas · wtyczki",
    title: "Wtyczki: sortowanie i przeszukiwanie",
    table: {
      headers: ["Klasa", "Odpowiedzialność", "Plik"],
      rows: [
        ["BubbleSortPlugin", "Sortowanie bąbelkowe: powtarzane zamiany sąsiednich elementów; emituje porównania i przestawienia", "core/plugins/sorting/BubbleSortPlugin.ts"],
        ["MergeSortPlugin", "Sortowanie przez scalanie (dziel i zwyciężaj): emituje podziały i scalanie podtablic", "core/plugins/sorting/MergeSortPlugin.ts"],
        ["QuickSortPlugin", "Sortowanie szybkie, partycja Lomuto (pivot = ostatni element): partycjonowanie i rekurencja", "core/plugins/sorting/QuickSortPlugin.ts"],
        ["HeapSortPlugin", "Sortowanie przez kopcowanie: budowa kopca i powtarzane sift-down; emituje operacje na kopcu", "core/plugins/sorting/HeapSortPlugin.ts"],
        ["LinearSearchPlugin", "Wyszukiwanie liniowe: sekwencyjne sprawdzanie elementów do trafienia", "core/plugins/searching/LinearSearchPlugin.ts"],
        ["BinarySearchPlugin", "Wyszukiwanie binarne na tablicy posortowanej: zawężanie przedziału lewy/środek/prawy", "core/plugins/searching/BinarySearchPlugin.ts"],
      ],
    },
    note: "Wszystkie implementują kontrakt AlgorithmPlugin<T>; metoda execute() zwraca ExecutionTrace.",
  },
  {
    id: 17,
    variant: "table",
    kicker: "Architektura klas · wtyczki",
    title: "Wtyczki: grafy",
    table: {
      headers: ["Klasa", "Odpowiedzialność", "Plik"],
      rows: [
        ["BFSPlugin", "Przeszukiwanie wszerz: kolejka FIFO, odwiedzanie warstwami; emituje kolejkowanie i odwiedziny", "core/plugins/graph/BFSPlugin.ts"],
        ["DFSPlugin", "Przeszukiwanie w głąb: stos/rekurencja, eksploracja gałęzi do końca", "core/plugins/graph/DFSPlugin.ts"],
        ["DijkstraPlugin", "Najkrótsze ścieżki z jednego źródła (wagi nieujemne): relaksacja krawędzi z kolejką priorytetową", "core/plugins/graph/DijkstraPlugin.ts"],
        ["KruskalPlugin", "Minimalne drzewo rozpinające: sortowanie krawędzi + union-find do wykrywania cykli", "core/plugins/graph/KruskalPlugin.ts"],
        ["PrimPlugin", "Minimalne drzewo rozpinające: rozrost drzewa przez najtańszą krawędź wychodzącą", "core/plugins/graph/PrimPlugin.ts"],
        ["TopoSortPlugin", "Sortowanie topologiczne DAG: porządkowanie wierzchołków zgodnie z zależnościami", "core/plugins/graph/TopoSortPlugin.ts"],
      ],
    },
  },
  {
    id: 18,
    variant: "table",
    kicker: "Architektura klas · wtyczki",
    title: "Wtyczki: drzewa",
    table: {
      headers: ["Klasa", "Odpowiedzialność", "Plik"],
      rows: [
        ["BinaryTreePlugin", "Przechodzenie drzewa wyrażeń: pre-order, in-order i post-order; emituje kolejność odwiedzin", "core/plugins/trees/BinaryTreePlugin.ts"],
        ["BSTPlugin", "Drzewo wyszukiwań binarnych: wstawianie z zachowaniem porządku; buduje strukturę z TreeNode", "core/plugins/trees/BSTPlugin.ts"],
        ["AVLTreePlugin", "Samobalansujące BST: po wstawieniu rotacje LL/RR/LR/RL; re-layout po każdej rotacji (AVLNode)", "core/plugins/trees/AVLTreePlugin.ts"],
        ["RBTPlugin", "Drzewo czerwono-czarne: wstawianie z rekolorowaniem i rotacjami pilnującymi niezmienników (RBTNode)", "core/plugins/trees/RBTPlugin.ts"],
        ["TriePlugin", "Drzewo prefiksowe: wstawianie słów znak po znaku z węzłów TrieNode", "core/plugins/trees/TriePlugin.ts"],
        ["MaxHeapPlugin", "Kopiec maksymalny: wstawianie i sift-up/sift-down; emituje operacje porządkujące kopiec", "core/plugins/trees/MaxHeapPlugin.ts"],
        ["HeapSortTreePlugin", "Sortowanie przez kopcowanie na drzewie: sift-up (budowa) + sift-down (sortowanie) z tablicą na żywo", "core/plugins/trees/HeapSortTreePlugin.ts"],
        ["UnionFindPlugin", "Zbiory rozłączne: operacje find/union z kompresją ścieżek i union by rank", "core/plugins/trees/UnionFindPlugin.ts"],
      ],
    },
  },
  {
    id: 19,
    variant: "table",
    kicker: "Architektura klas · wtyczki",
    title: "Wtyczki: programowanie dynamiczne i pathfinding",
    table: {
      headers: ["Klasa", "Odpowiedzialność", "Plik"],
      rows: [
        ["KnapsackDPPlugin", "Problem plecakowy 0/1: wypełnianie tabeli DP wartościami dla pojemności i przedmiotów", "core/plugins/dp/KnapsackDPPlugin.ts"],
        ["LCSPlugin", "Najdłuższy wspólny podciąg: tabela DP porównań znaków dwóch ciągów + odtworzenie wyniku", "core/plugins/dp/LCSPlugin.ts"],
        ["AStarPlugin", "Wyszukiwanie ścieżki A*: koszt rzeczywisty + heurystyka na siatce; emituje rozwijane komórki", "core/plugins/grid/AStarPlugin.ts"],
        ["FloodFillPlugin", "Wypełnianie obszaru: rozlewanie od punktu startowego na sąsiednie komórki siatki", "core/plugins/grid/FloodFillPlugin.ts"],
      ],
    },
    note: "Łącznie 23 wtyczki w 6 kategoriach. Rejestr w workerze mapuje id → instancję, więc dodanie algorytmu nie dotyka silnika (wzorzec Strategy).",
  },
  {
    id: 20,
    variant: "table",
    kicker: "Architektura klas · backend",
    title: "Backend — struktury Go",
    table: {
      headers: ["Struct", "Odpowiedzialność", "Plik"],
      rows: [
        ["Snapshot", "Model GORM: trwały zapis wizualizacji (ID, Data, CreatedAt) w PostgreSQL", "backend/main.go"],
        ["RunRequest", "Kontrakt wejścia API: kod użytkownika i język do wykonania w sandboxie", "backend/main.go"],
        ["RunResponse", "Kontrakt wyjścia API: ślad wykonania, ewentualny błąd i standardowe wyjście", "backend/main.go"],
      ],
    },
    note: "Go nie ma klas — struct jest jego odpowiednikiem. Te trzy typy domykają warstwę zapisu i komunikacji z sandboxem.",
  },
  {
    id: 21,
    variant: "table",
    kicker: "Architektura klas · Python",
    title: "Implementacje referencyjne (Python)",
    table: {
      headers: ["Klasa", "Odpowiedzialność", "Plik"],
      rows: [
        ["Node (BST)", "Węzeł drzewa BST: wartość i wskaźniki na dzieci", "algorithms/python/bst.py"],
        ["Node (binarne)", "Węzeł drzewa binarnego dla referencyjnego przechodzenia", "algorithms/python/binary.py"],
        ["Node (RBT)", "Węzeł czerwono-czarny: wartość, kolor, rodzic i dzieci", "algorithms/python/rbt.py"],
        ["RedBlackTree", "Pełna implementacja drzewa czerwono-czarnego z rotacjami i rekolorowaniem", "algorithms/python/rbt.py"],
        ["AVLNode", "Węzeł AVL z wysokością do balansowania", "algorithms/python/avl.py"],
        ["Trie", "Drzewo prefiksowe: wstawianie i wyszukiwanie słów oraz prefiksów", "algorithms/python/trie.py"],
        ["TrieNode", "Węzeł trie: dzieci indeksowane znakami i znacznik końca słowa", "algorithms/python/trie.py"],
        ["UnionFind", "Zbiory rozłączne z kompresją ścieżek i union by rank (np. dla Kruskala)", "algorithms/python/union-find.py"],
        ["SNode (AVL)", "Lokalny węzeł statycznego layoutu AVL (val, id, dzieci, height) — buduje układ drzewa dla zdarzenia INIT", "algorithms/python/avl.py"],
        ["SNode (RBT)", "Lokalny węzeł statycznego layoutu RBT (val, id, kolor, rodzic, dzieci) — układ początkowy dla zdarzenia INIT", "algorithms/python/rbt.py"],
      ],
    },
    note: "Kod uruchamiany w izolowanym kontenerze Docker. Druga, niezależna od frontu, rodzina klas struktur danych — pokazuje ten sam algorytm w realnym kodzie wykonywanym po stronie backendu. Dwie klasy SNode to lokalne węzły pomocnicze budujące statyczny layout drzewa przed animacją.",
  },

  // ── 13. React re-render trap ─────────────────────────────
  {
    id: 22,
    variant: "content",
    kicker: "Wydajność",
    title: "Pułapka: setState na każdą klatkę",
    bullets: [
      "Każdy setState() uruchamia reconciliację Virtual DOM — koszt rośnie z liczbą węzłów.",
      "Quick Sort dla 100 elementów emituje setki zdarzeń/s → janking UI.",
      "Animacja wysokiej częstotliwości musi omijać cykl renderowania Reacta.",
    ],
    note: "React jest świetny do struktury UI, ale za ciężki jako kanał 100+ aktualizacji/s. Rozwiązanie: zdarzenia trafiają wprost do elementów SVG, z pominięciem stanu Reacta.",
  },

  // ── 14. EventBus ─────────────────────────────────────────
  {
    id: 23,
    variant: "content",
    kicker: "Wydajność",
    title: "EventBus — kanał obok Reacta",
    bullets: [
      "Wzorzec Observer: emit() synchronicznie woła subskrybentów (O(n) słuchaczy).",
      "Węzły SVG subskrybują bezpośrednio — React nie jest informowany o klatce.",
    ],
    code: {
      language: "typescript",
      filePath: "src/core/EventBus.ts",
      code: `export class AnimationEventBus {
  private listeners: EventListener[] = [];

  public emit(event: VisualizationEvent): void {
    for (const listener of this.listeners) listener(event);
  }
  public subscribe(listener: EventListener): () => void {
    this.listeners.push(listener);
    return () =>
      (this.listeners = this.listeners.filter((l) => l !== listener));
  }
}
export const globalEventBus = new AnimationEventBus();`,
    },
    note: "Jedna globalna instancja jako źródło prawdy. Tylko zainteresowane węzły reagują na zdarzenie — zamiast przerysowywać całe drzewo Reacta.",
  },

  // ── 15. RAF playback ─────────────────────────────────────
  {
    id: 24,
    variant: "content",
    kicker: "Wydajność",
    title: "Odtwarzanie na requestAnimationFrame",
    bullets: [
      "Akumulacja deltaTime → tempo niezależne od odświeżania monitora (60/120/144 Hz).",
      "Prędkość odtwarzania skaluje próg ticka, nie liczbę klatek.",
      "Pętla nadrabia zaległe kroki w jednej klatce, gdy karta była w tle.",
    ],
    code: {
      language: "typescript",
      filePath: "src/core/AnimationEngine.ts",
      code: `private animationLoop = (currentTime: number) => {
  const deltaTime = currentTime - this.lastFrameTime;
  this.lastFrameTime = currentTime;
  this.accumulatedTime += deltaTime;

  const adjustedTickMs = this.baseTickMs / this.playbackSpeed;
  while (this.accumulatedTime >= adjustedTickMs && this.isPlaying) {
    this.stepForward();                 // emit następnego zdarzenia
    this.accumulatedTime -= adjustedTickMs;
  }
  this.rafId = requestAnimationFrame(this.animationLoop);
};`,
    },
    note: "baseTickMs = 500 ms przy 1.0x. Akumulator gwarantuje stałe tempo logiczne, niezależnie od częstotliwości klatek przeglądarki.",
  },

  // ── 16. Web Workers ──────────────────────────────────────
  {
    id: 25,
    variant: "content",
    kicker: "Współbieżność",
    title: "Web Workers: ciężkie obliczenia poza wątkiem UI",
    bullets: [
      "JS w przeglądarce ma jeden wątek główny — generowanie śladu blokowałoby UI.",
      "Wtyczki uruchamiane są w workerze; komunikacja przez postMessage.",
      "Rejestr id → instancja: worker nie zna szczegółów algorytmu.",
    ],
    code: {
      language: "typescript",
      filePath: "src/core/workers/algo.worker.ts",
      code: `const PLUGINS: Record<string, AlgorithmPlugin<any>> = {
  "merge-sort": new MergeSortPlugin(),
  dijkstra: new DijkstraPlugin(),
  avl: new AVLTreePlugin(),
  "a-star": new AStarPlugin(),
};

self.addEventListener("message", (e: MessageEvent<WorkerMessage>) => {
  const { taskId, algorithmId, payload } = e.data;
  const trace = PLUGINS[algorithmId].execute(payload);
  self.postMessage({ taskId, status: "ok", trace });
});`,
    },
    note: "Ten sam zestaw wtyczek napędza zarówno worker (offline), jak i fallback gdy backend/Docker jest niedostępny.",
  },

  // ── 17. WorkerPool ───────────────────────────────────────
  {
    id: 26,
    variant: "content",
    kicker: "Wzorzec",
    title: "WorkerPool (Object Pool) + kolejka FIFO",
    bullets: [
      "Pula 3 workerów tworzona z góry — brak kosztu spawnu w trakcie.",
      "Zadanie trafia do wolnego workera lub do kolejki, gdy wszystkie zajęte.",
      "Mapa taskId → {resolve, reject} dopasowuje odpowiedź do Promise.",
    ],
    code: {
      language: "typescript",
      filePath: "src/core/WorkerPool.ts",
      code: `export class WorkerPool {
  private pool: PoolWorker[] = [];
  constructor(private maxWorkers = 3) { this.spawnWorkers(); }

  private spawnWorkers() {
    for (let i = 0; i < this.maxWorkers; i++) {
      const worker = new Worker(
        new URL("./workers/algo.worker.ts", import.meta.url),
        { type: "module" },
      );
      this.pool.push({ worker, state: "idle" });
    }
  }
  run(algorithmId: string, payload: VisualizationData) {
    const idle = this.pool.find((pw) => pw.state === "idle");
    // idle ? dispatch(idle, ...) : taskQueue.push(...)  → FIFO
  }
}`,
    },
    note: "Object Pool ogranicza presję na GC i daje natychmiastową dostępność wątku. drainQueue() przekazuje kolejne zadanie do workera, który właśnie się zwolnił.",
  },

  // ── 18. Docker health-check / fallback ───────────────────
  {
    id: 27,
    variant: "content",
    kicker: "Niezawodność",
    title: "Degradacja: Docker → wykonanie lokalne",
    bullets: [
      "Ping demona Dockera z budżetem 800 ms zanim podejmiemy próbę sandboxa.",
      "Brak demona → fallback na hosta (executeLocally), bez błędu dla użytkownika.",
    ],
    code: {
      language: "go",
      filePath: "backend/main.go",
      code: `cli, err := client.NewClientWithOpts(
    client.FromEnv, client.WithVersion("1.44"))

ctx, cancel := context.WithTimeout(
    context.Background(), 800*time.Millisecond)
_, pingErr := cli.Ping(ctx)
cancel()

if pingErr == nil {
    dockerRunning = true                 // izolowany kontener
} else {
    rawOutput, stderr, _ =               // fallback na host
        executeLocally(req.Code, req.Language)
}`,
    },
    note: "System degraduje się płynnie: pełna izolacja gdy Docker jest dostępny, a w środowiskach bez Dockera nadal zwraca poprawny ślad.",
  },

  // ── 19. Natywny silnik SVG ───────────────────────────────
  {
    id: 28,
    variant: "content",
    kicker: "Rendering",
    title: "Natywna scena SVG + filtry glow",
    bullets: [
      "Filtr SVG (feGaussianBlur + feMerge) daje efekt poświaty per-węzeł.",
      "Framer Motion: przejścia oparte na sprężynie (spring), nie na sztywnym czasie.",
    ],
    code: {
      language: "markup",
      filePath: "src/components/visualizer/NativeGraphStage.tsx",
      code: `<filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
  <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur" />
  <feFlood floodColor="#38bdf8" floodOpacity="0.35" result="color" />
  <feComposite in="color" in2="blur" operator="in" result="glow" />
  <feMerge>
    <feMergeNode in="glow" />
    <feMergeNode in="SourceGraphic" />
  </feMerge>
</filter>`,
    },
    note: "Animacje węzłów: transition spring (stiffness 120, damping 14) — ruch wygląda fizycznie, bez ręcznego dobierania czasów trwania.",
  },

  // ── 20. Reverse playback ─────────────────────────────────
  {
    id: 29,
    variant: "content",
    kicker: "Funkcja",
    title: "Odtwarzanie wstecz w O(1) na krok",
    bullets: [
      "Zdarzenia mutujące niosą stan sprzed operacji (np. previousValue).",
      "Cofnięcie = ponowna emisja zdarzenia z flagą isReverse — bez historii całego stanu.",
    ],
    code: {
      language: "typescript",
      filePath: "src/core/AnimationEngine.ts",
      code: `public stepBackward(): void {
  if (!this.currentTrace || this.currentStep <= 0) return;
  this.currentStep--;
  const event = {
    ...this.currentTrace.events[this.currentStep],
    isReverse: true,                    // scena odwraca operację
  };
  globalEventBus.emit(event);
}`,
      caption: 'np. { type: "ARRAY_SET"; index: 2; value: 42; previousValue: 7 }',
    },
    note: "Subskrybent czyta previousValue i przywraca poprzedni stan — koszt O(1) na krok, bez magazynowania pełnych snapshotów.",
  },

  // ── 21. Podsumowanie ─────────────────────────────────────
  {
    id: 30,
    variant: "content",
    kicker: "Podsumowanie",
    title: "Trzy problemy, trzy rozwiązania",
    bullets: [
      "Wydajność animacji → EventBus + requestAnimationFrame (poza Reactem).",
      "Bezpieczeństwo wykonania → Docker: namespaces + cgroups + watchdog.",
      "Rozszerzalność → Strategy (AlgorithmPlugin) + WorkerPool.",
    ],
    note: "EDVR jako system full-stack: realne wykonanie kodu, izolacja kontenerowa i renderowanie wysokiej częstotliwości złożone w jeden, deterministyczny pipeline.",
    repo: "github.com/JakubRzadzki/visual_algo",
  },

  // ── Warstwa doświadczenia (UI/UX · tło · motyw · i18n) ────
  {
    id: 31,
    variant: "content",
    kicker: "UI / UX",
    title: "Warstwa doświadczenia: glassmorphism + HUD",
    bullets: [
      "Trójkolumnowy workspace: scena wizualizacji • edytor Monaco • panele HUD (statystyki, log zdarzeń, teoria).",
      "Spójny język wizualny oparty na tokenach CSS (var(--bg-card), backdrop-blur) — jeden „glass-panel\" w całej aplikacji.",
      "Mikrointerakcje Framer Motion (spring) + dostępność: AriaLiveRegion ogłasza kroki algorytmu czytnikom ekranu.",
    ],
    code: {
      language: "css",
      filePath: "src/index.css",
      code: `@layer components {
  .glass-panel {
    background: var(--bg-card);              /* token motywu */
    border: 1px solid var(--border-subtle);
    box-shadow: var(--shadow-card);
    /* płynne przejście przy zmianie motywu */
    transition: background-color .3s ease,
                border-color .3s ease, box-shadow .3s ease;
  }
  .glass-panel-elevated { @apply backdrop-blur-xl rounded-2xl; }
}`,
      caption: "Komponenty nie znają kolorów — czytają tokeny, więc motyw zmienia się globalnie.",
    },
    note: "Layout jest sterowany danymi (HUD odbiera zdarzenia z EventBus), a styl — tokenami CSS. Dzięki temu te same panele działają w trybie ciemnym i jasnym bez duplikacji stylów.",
  },

  // ── Animacja tła — silnik ────────────────────────────────
  {
    id: 32,
    variant: "content",
    kicker: "Tło — silnik",
    title: "Ambientowe tło: pole cząstek na Canvas 2D",
    bullets: [
      "100 węzłów dryfuje z odbiciem od krawędzi; krawędź rysowana tylko gdy para < 200 px (próg odległości).",
      "Renderowanie poza Reactem — pętla requestAnimationFrame maluje wprost po kontekście 2D, zero re-renderów.",
      "Subtelne strumienie binarne (0/1) i pulsujące węzły budują „neuronowy\" klimat bez żadnej biblioteki.",
    ],
    code: {
      language: "typescript",
      filePath: "src/components/background/AmbientGraph.tsx",
      code: `const draw = () => {
  ctx.clearRect(0, 0, width, height);
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    p1.x += p1.vx; p1.y += p1.vy;                  // dryf
    if (p1.x <= 0 || p1.x >= width) p1.vx *= -1;   // odbicie od ściany
    for (let j = i + 1; j < points.length; j++) {
      const dx = p1.x - points[j].x, dy = p1.y - points[j].y;
      if (dx * dx + dy * dy < 40000)               // łącz tylko < 200 px
        drawLink(p1, points[j], dx, dy);           // alfa ∝ bliskość
    }
  }
  requestAnimationFrame(draw);
};`,
      caption: "O(n²) par na klatkę, ale operacje canvasa są tanie — przy n=100 to ~5 000 testów odległości.",
    },
    note: "Klucz wydajności: animacja żyje całkowicie obok Reacta. Brak setState w pętli = brak reconciliacji Virtual DOM — dokładnie ta sama zasada, co EventBus dla scen algorytmów.",
  },

  // ── Animacja tła — interakcja ────────────────────────────
  {
    id: 33,
    variant: "content",
    kicker: "Tło — interakcja",
    title: "Reakcja tła na kursor i kliknięcia",
    bullets: [
      "Canvas ma pointer-events-none → nasłuch podpięty do window, by nie blokować interfejsu pod spodem.",
      "Kursor przyciąga węzły w promieniu 190 px i łączy je liniami; kliknięcie nadaje impuls rozpychający (burst).",
      "Stabilność: prędkość wraca do bazowego dryfu (easing) i jest ograniczana (clamp), więc pole samo się wycisza.",
    ],
    code: {
      language: "typescript",
      filePath: "src/components/background/AmbientGraph.tsx",
      code: `// kliknięcie → impuls rozpychający pobliskie cząstki
window.addEventListener("mousedown", (e) => {
  for (const p of points) {
    const dx = p.x - e.clientX, dy = p.y - e.clientY;
    const d = Math.hypot(dx, dy);
    if (d < CLICK_RADIUS && d > 0.01) {
      const force = (1 - d / CLICK_RADIUS) * 5.5;
      p.vx += (dx / d) * force; p.vy += (dy / d) * force;
    }
  }
});

// w pętli: powrót do dryfu + przycięcie prędkości
p.vx += (p.bvx - p.vx) * 0.02;                  // self-calming
const sp = Math.hypot(p.vx, p.vy);
if (sp > MAX_SPEED) { p.vx = p.vx / sp * MAX_SPEED; /* …vy */ }`,
      caption: "bvx/bvy = bazowy dryf cząstki; impuls dodaje energię, easing ją z czasem rozprasza.",
    },
    note: "Efekt jest „żywy\", ale nie chaotyczny: każda cząstka pamięta swój spokojny dryf i wraca do niego, a clamp gwarantuje, że nawet seria kliknięć nie rozbije pola.",
  },

  // ── Dark / Light ─────────────────────────────────────────
  {
    id: 34,
    variant: "content",
    kicker: "Motyw",
    title: "Dark / Light: tokeny CSS + jedna klasa",
    bullets: [
      "Cała paleta to zmienne CSS w :root; klasa .light-mode nadpisuje tokeny — komponenty nie znają konkretnych wartości.",
      "toggleTheme przełącza klasę na <html> i <body> oraz utrwala wybór w localStorage (edvr-theme).",
      "Tło re-inicjalizuje canvas przy zmianie motywu i czyta --star-color, więc cząstki pasują do palety.",
    ],
    code: {
      language: "typescript",
      filePath: "src/store/uiStore.ts",
      code: `toggleTheme: () =>
  set((state) => {
    const next = state.theme === "dark" ? "light" : "dark";
    localStorage.setItem("edvr-theme", next);
    // jedna klasa steruje całą paletą motywu
    [document.documentElement, document.body].forEach((el) =>
      el.classList.toggle("light-mode", next === "light"));
    return { theme: next };
  }),`,
      caption:
        ":root → --star-color: rgba(255,255,255,.6) · .light-mode → rgba(100,120,180,.25)",
    },
    note: "Zmiana motywu to jedna operacja na klasie DOM — przeglądarka przelicza wszystkie var(--…) naraz. Zero przekazywania motywu przez propsy, zero warunków w komponentach.",
  },

  // ── i18n EN / PL ─────────────────────────────────────────
  {
    id: 35,
    variant: "content",
    kicker: "i18n",
    title: "Dwujęzyczność EN / PL bez bibliotek",
    bullets: [
      "Słownik TRANSLATIONS z gałęziami en/pl; getTranslation(lang) zwraca jedną z nich — typ wymusza komplet kluczy.",
      "Język trzymany w Zustand (+ localStorage); selektor renderuje tylko komponenty faktycznie używające tłumaczeń.",
      "Treść merytoryczna (teoria, etykiety HUD, kategorie) ma warianty pl/en współdzielone w całej aplikacji.",
    ],
    code: {
      language: "typescript",
      filePath: "src/data/translations.ts",
      code: `export const TRANSLATIONS = {
  en: { run: "Run",     categories: { grid: "Grid / Mazes" }, /* … */ },
  pl: { run: "Uruchom", categories: { grid: "Siatka / Labirynty" }, /* … */ },
};

export function getTranslation(lang: "en" | "pl") {
  return TRANSLATIONS[lang];        // brak klucza = błąd kompilacji
}

// komponent: re-render tylko przy zmianie języka
const t = getTranslation(useUIStore((s) => s.language));`,
      caption: "Typowanie strukturalne gwarantuje, że pl i en mają identyczny zestaw kluczy.",
    },
    note: "Lekki, własny i18n: brak runtime'owej biblioteki, brak ładowania plików. Kompilator pilnuje kompletności tłumaczeń, a Zustand izoluje przerysowania do komponentów zależnych od języka.",
  },

  // ── Galeria algorytmów ───────────────────────────────────
  {
    id: 36,
    variant: "content",
    kicker: "Sortowanie",
    title: "Bubble Sort",
    complexity: "O(n²) · O(1)",
    code: {
      language: "typescript",
      filePath: "src/core/plugins/sorting/BubbleSortPlugin.ts",
      code: `for (let i = 0; i < n - 1; i++)
  for (let j = 0; j < n - i - 1; j++)
    if (arr[j] > arr[j + 1]) {
      emit({ type: "ARRAY_SWAP", indices: [j, j + 1], values: [arr[j + 1], arr[j]] });
      [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
    }`,
      caption: "O(n²) czas, O(1) pamięć.",
    },
  },
  {
    id: 37,
    variant: "content",
    kicker: "Sortowanie",
    title: "Merge Sort",
    complexity: "O(n log n) · O(n)",
    code: {
      language: "typescript",
      filePath: "src/core/plugins/sorting/MergeSortPlugin.ts",
      code: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const m = Math.floor(arr.length / 2);
  return merge(mergeSort(arr.slice(0, m)), mergeSort(arr.slice(m)));
}`,
      caption: "O(n log n) czas, O(n) pamięci pomocniczej.",
    },
  },
  {
    id: 38,
    variant: "content",
    kicker: "Sortowanie",
    title: "Quick Sort (Lomuto)",
    complexity: "O(n log n) śr. · O(n²) pes.",
    code: {
      language: "typescript",
      filePath: "src/core/plugins/sorting/QuickSortPlugin.ts",
      code: `function partition(arr, lo, hi) {
  const pivot = arr[hi]; let i = lo - 1;
  for (let j = lo; j < hi; j++)
    if (arr[j] <= pivot) { i++; [arr[i], arr[j]] = [arr[j], arr[i]]; }
  [arr[i + 1], arr[hi]] = [arr[hi], arr[i + 1]];
  return i + 1;
}`,
      caption: "Średnio O(n log n), pesymistycznie O(n²).",
    },
  },
  {
    id: 39,
    variant: "content",
    kicker: "Sortowanie",
    title: "Heap Sort",
    complexity: "O(n log n) · O(1)",
    code: {
      language: "typescript",
      filePath: "src/core/plugins/sorting/HeapSortPlugin.ts",
      code: `function heapify(arr, n, i) {
  let largest = i, l = 2 * i + 1, r = 2 * i + 2;
  if (l < n && arr[l] > arr[largest]) largest = l;
  if (r < n && arr[r] > arr[largest]) largest = r;
  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    heapify(arr, n, largest);
  }
}`,
      caption: "O(n log n) czas, O(1) pamięć (in-place).",
    },
  },
  {
    id: 40,
    variant: "content",
    kicker: "Przeszukiwanie",
    title: "Linear Search",
    complexity: "O(n)",
    code: {
      language: "typescript",
      filePath: "src/core/plugins/searching/LinearSearchPlugin.ts",
      code: `for (let i = 0; i < arr.length; i++) {
  emit({ type: "SEARCH_CHECK", index: i, value: arr[i], target });
  if (arr[i] === target) return i;
}`,
      caption: "O(n), nie wymaga posortowania.",
    },
  },
  {
    id: 41,
    variant: "content",
    kicker: "Przeszukiwanie",
    title: "Binary Search",
    complexity: "O(log n)",
    code: {
      language: "typescript",
      filePath: "src/core/plugins/searching/BinarySearchPlugin.ts",
      code: `let lo = 0, hi = arr.length - 1;
while (lo <= hi) {
  const mid = (lo + hi) >> 1;
  if (arr[mid] === target) return mid;
  else if (arr[mid] < target) lo = mid + 1;
  else hi = mid - 1;
}`,
      caption: "O(log n), wymaga posortowanej tablicy.",
    },
  },
  {
    id: 42,
    variant: "content",
    kicker: "Grafy",
    title: "BFS — przeszukiwanie wszerz",
    complexity: "O(V + E)",
    code: {
      language: "typescript",
      filePath: "src/core/plugins/graph/BFSPlugin.ts",
      code: `const q = [start]; visited.add(start);
while (q.length) {
  const node = q.shift();
  for (const nb of graph[node])
    if (!visited.has(nb)) {
      visited.add(nb); q.push(nb);
      emit({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: nb, status: "visited" });
    }
}`,
      caption: "O(V+E), najkrótsza ścieżka w grafie bez wag.",
    },
  },
  {
    id: 43,
    variant: "content",
    kicker: "Grafy",
    title: "DFS — przeszukiwanie w głąb",
    complexity: "O(V + E)",
    code: {
      language: "typescript",
      filePath: "src/core/plugins/graph/DFSPlugin.ts",
      code: `function dfs(v) {
  visited.add(v);
  for (const nb of graph[v])
    if (!visited.has(nb)) dfs(nb);
}`,
      caption: "O(V+E), wykrywanie cykli, topologia.",
    },
  },
  {
    id: 44,
    variant: "content",
    kicker: "Grafy",
    title: "Dijkstra",
    complexity: "O((V + E) log V)",
    code: {
      language: "typescript",
      filePath: "src/core/plugins/graph/DijkstraPlugin.ts",
      code: `const dist = Array(V).fill(Infinity); dist[start] = 0;
const pq = new MinHeap(); pq.push({ node: start, d: 0 });
while (!pq.empty()) {
  const { node, d } = pq.pop();
  if (d > dist[node]) continue;
  for (const [nb, w] of graph[node])
    if (dist[nb] > dist[node] + w) {
      dist[nb] = dist[node] + w;
      emit({ type: "GRAPH_RELAX", edgeId: edge(node, nb), weight: dist[nb] });
    }
}`,
      caption: "O((V+E) log V), wagi ≥ 0.",
    },
  },
  {
    id: 45,
    variant: "content",
    kicker: "Grafy",
    title: "Kruskal (MST)",
    complexity: "O(E log E)",
    code: {
      language: "typescript",
      filePath: "src/core/plugins/graph/KruskalPlugin.ts",
      code: `edges.sort((a, b) => a.w - b.w);
const uf = new UnionFind(V);
for (const { u, v, w } of edges)
  if (uf.find(u) !== uf.find(v)) {
    uf.union(u, v); mst.push({ u, v, w });
  }`,
      caption: "O(E log E), struktura Union-Find.",
    },
  },
  {
    id: 46,
    variant: "content",
    kicker: "Grafy",
    title: "Prim (MST)",
    complexity: "O((V + E) log V)",
    code: {
      language: "typescript",
      filePath: "src/core/plugins/graph/PrimPlugin.ts",
      code: `const key = Array(V).fill(Infinity); key[0] = 0;
for (let i = 0; i < V; i++) {
  const u = minKey(key, visited);
  visited[u] = true;
  for (const [v, w] of graph[u])
    if (!visited[v] && w < key[v]) key[v] = w;
}`,
      caption: "Naiwnie O(V²), z kopcem O((V+E) log V).",
    },
  },
  {
    id: 47,
    variant: "content",
    kicker: "Grafy",
    title: "Topological Sort",
    complexity: "O(V + E)",
    code: {
      language: "typescript",
      filePath: "src/core/plugins/graph/TopoSortPlugin.ts",
      code: `function dfs(v, stack) {
  visited[v] = true;
  for (const u of graph[v])
    if (!visited[u]) dfs(u, stack);
  stack.push(v); // post-order → odwrócony = porządek topologiczny
}`,
      caption: "O(V+E), wyłącznie dla DAG.",
    },
  },
  {
    id: 48,
    variant: "content",
    kicker: "Drzewa",
    title: "Przechodzenie drzewa binarnego",
    complexity: "O(n) · O(h)",
    code: {
      language: "typescript",
      filePath: "src/core/plugins/trees/BinaryTreePlugin.ts",
      code: `function inorder(n)   { if (!n) return; inorder(n.left);  visit(n); inorder(n.right); }
function preorder(n)  { if (!n) return; visit(n); preorder(n.left);  preorder(n.right); }
function postorder(n) { if (!n) return; postorder(n.left); postorder(n.right); visit(n); }`,
      caption: "O(n) czas, O(h) stos rekurencji.",
    },
  },
  {
    id: 49,
    variant: "content",
    kicker: "Drzewa",
    title: "BST — wstawianie",
    complexity: "O(log n) śr. · O(n) pes.",
    code: {
      language: "typescript",
      filePath: "src/core/plugins/trees/BSTPlugin.ts",
      code: `function insert(root, val) {
  if (!root) return new Node(val);
  if (val < root.val) root.left = insert(root.left, val);
  else root.right = insert(root.right, val);
  return root;
}`,
      caption: "Średnio O(log n), pesymistycznie O(n) (drzewo zdegenerowane).",
    },
  },
  {
    id: 50,
    variant: "content",
    kicker: "Drzewa",
    title: "AVL",
    complexity: "O(log n)",
    code: {
      language: "typescript",
      filePath: "src/core/plugins/trees/AVLTreePlugin.ts",
      code: `function rotateRight(y) {
  const x = y.left, T2 = x.right;
  x.right = y; y.left = T2;
  updateHeight(y); updateHeight(x);
  emit({ type: "TREE_ROTATE", pivotId: y.id, direction: "RIGHT" });
  return x; // nowy korzeń poddrzewa
}`,
      caption: "Gwarantowane O(log n) dzięki samobalansowaniu (|balans| ≤ 1).",
    },
  },
  {
    id: 51,
    variant: "content",
    kicker: "Drzewa",
    title: "Red-Black Tree",
    complexity: "wys. ≤ 2 log(n+1)",
    code: {
      language: "typescript",
      filePath: "src/core/plugins/trees/RBTPlugin.ts",
      code: `while (node.parent?.color === "red") {
  const uncle = getUncle(node);
  if (uncle?.color === "red") {        // Case 1: przekolorowanie
    recolor(node);
    node = node.parent.parent;
  } else {                             // Case 2/3: rotacja + kolory
    node = rotateAndRecolor(node);
  }
}
root.color = "black";`,
      caption: "Wysokość ≤ 2·log(n+1); używane m.in. w std::map.",
    },
  },
  {
    id: 52,
    variant: "content",
    kicker: "Drzewa",
    title: "Trie — drzewo prefiksowe",
    complexity: "O(L) na słowo",
    code: {
      language: "typescript",
      filePath: "src/core/plugins/trees/TriePlugin.ts",
      code: `function insert(word) {
  let curr = root;
  for (const ch of word) {                 // O(L) — długość słowa
    if (!curr.children.has(ch))
      curr.children.set(ch, new TrieNode(ch));
    curr = curr.children.get(ch);
  }
  curr.isEndOfWord = true;                  // oznacz koniec słowa
}`,
      caption: "O(L) na wstawienie/wyszukanie; wspólne prefiksy dzielą węzły.",
    },
  },
  {
    id: 53,
    variant: "content",
    kicker: "Drzewa",
    title: "Sortowanie przez kopcowanie (drzewo)",
    complexity: "O(n log n) · O(1)",
    code: {
      language: "typescript",
      filePath: "src/core/plugins/trees/HeapSortTreePlugin.ts",
      code: `// Faza 1: budowa kopca maksymalnego (bottom-up heapify)
for (let i = Math.floor(n / 2) - 1; i >= 0; i--)
  siftDown(heap, n, i);

// Faza 2: wyodrębnianie — drzewo się kurczy
for (let i = n - 1; i >= 1; i--) {
  swap(heap, 0, i);          // max ląduje na pozycji i
  removeNode("p" + i);       // węzeł znika z drzewa
  siftDown(heap, i, 0);      // napraw kopiec rozmiaru i
}`,
      caption:
        "Korzeń (max) jest wyciągany i usuwany z drzewa — wartości trafiają do posortowanej tablicy na żywo.",
    },
  },
  {
    id: 54,
    variant: "content",
    kicker: "Programowanie dynamiczne",
    title: "0/1 Knapsack",
    complexity: "O(n·W) · O(n·W)",
    code: {
      language: "typescript",
      filePath: "src/core/plugins/dp/KnapsackDPPlugin.ts",
      code: `// dp[i][w] = maks. wartość dla i przedmiotów i pojemności w
for (let i = 1; i <= n; i++)
  for (let w = 1; w <= W; w++)
    dp[i][w] = wt[i - 1] <= w
      ? Math.max(dp[i - 1][w], val[i - 1] + dp[i - 1][w - wt[i - 1]])
      : dp[i - 1][w];`,
      caption: "O(n·W) — każda komórka emitowana jako MATRIX_CELL_UPDATE.",
    },
  },
  {
    id: 55,
    variant: "content",
    kicker: "Programowanie dynamiczne",
    title: "LCS — najdłuższy wspólny podciąg",
    complexity: "O(m·n) · O(m·n)",
    code: {
      language: "typescript",
      filePath: "src/core/plugins/dp/LCSPlugin.ts",
      code: `for (let i = 1; i <= m; i++)
  for (let j = 1; j <= n; j++)
    dp[i][j] = text1[i - 1] === text2[j - 1]
      ? dp[i - 1][j - 1] + 1                        // znaki zgodne
      : Math.max(dp[i - 1][j], dp[i][j - 1]);       // pomiń jeden znak
// backtracking od dp[m][n] rekonstruuje sam podciąg`,
      caption: "O(m·n); zależności komórek wizualizowane, potem backtracking.",
    },
  },
  {
    id: 56,
    variant: "content",
    kicker: "Pathfinding",
    title: "A* Pathfinding",
    complexity: "f(n) = g(n) + h(n)",
    code: {
      language: "typescript",
      filePath: "src/core/plugins/grid/AStarPlugin.ts",
      code: `const open = new MinHeap(); open.push(start, h(start, goal));
while (!open.empty()) {
  const cur = open.pop();
  if (cur === goal) break;
  for (const nb of neighbors(cur)) {
    const g = cur.g + 1;
    if (g < nb.g) { nb.g = g; nb.f = g + h(nb, goal); open.push(nb); }
  }
}`,
      caption: "Heurystyka Manhattan przyspiesza przeszukiwanie względem Dijkstry.",
    },
  },
  {
    id: 57,
    variant: "content",
    kicker: "Pathfinding",
    title: "Flood Fill",
    complexity: "O(N)",
    code: {
      language: "typescript",
      filePath: "src/core/plugins/grid/FloodFillPlugin.ts",
      code: `const q = [[r, c]];
while (q.length) {
  const [x, y] = q.shift();
  if (!inBounds(x, y) || walls.has(key(x, y)) || visited.has(key(x, y))) continue;
  visited.add(key(x, y));
  emit({ type: "MATRIX_CELL_HIGHLIGHT", row: x, col: y, color: "#0ea5e9" });
  q.push([x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]);
}`,
      caption: "O(N) — każda komórka odwiedzana raz.",
    },
  },

  // ── Zakończenie ──────────────────────────────────────────
  {
    id: 58,
    variant: "closing",
    kicker: "Koniec",
    title: "Dziękujemy za uwagę",
    subtitle: "Pytania?",
    repo: "github.com/JakubRzadzki/visual_algo",
  },
];

/**
 * Maps each algorithm slide to the live in-app visualization route, so the
 * presentation can navigate to the real visualizer and play the animation
 * underneath the slide content.
 */
// Canonical 1-based slide numbers are derived from array order, so inserting or
// reordering slides never requires manual renumbering. The literal `id` fields
// in the slide objects above are authoring hints only — this loop is the source
// of truth for the number shown in the deck and used by LIVE_ROUTES below.
PRESENTATION_SLIDES.forEach((slide, index) => {
  slide.id = index + 1;
});

const LIVE_ROUTES: Record<number, { route: string; categoryId: string }> = {
  36: { route: "/algo/sorting/bubble-sort", categoryId: "sorting" },
  37: { route: "/algo/sorting/merge-sort", categoryId: "sorting" },
  38: { route: "/algo/sorting/quick-sort", categoryId: "sorting" },
  39: { route: "/algo/sorting/heap-sort", categoryId: "sorting" },
  40: { route: "/algo/searching/linear-search", categoryId: "searching" },
  41: { route: "/algo/searching/binary-search", categoryId: "searching" },
  42: { route: "/algo/graphs/bfs", categoryId: "graphs" },
  43: { route: "/algo/graphs/dfs", categoryId: "graphs" },
  44: { route: "/algo/graphs/dijkstra", categoryId: "graphs" },
  45: { route: "/algo/graphs/kruskal", categoryId: "graphs" },
  46: { route: "/algo/graphs/prim", categoryId: "graphs" },
  47: { route: "/algo/graphs/topo-sort", categoryId: "graphs" },
  48: { route: "/algo/trees/binary", categoryId: "trees" },
  49: { route: "/algo/trees/bst", categoryId: "trees" },
  50: { route: "/algo/trees/avl", categoryId: "trees" },
  51: { route: "/algo/trees/rbt", categoryId: "trees" },
  52: { route: "/algo/trees/trie", categoryId: "trees" },
  53: { route: "/algo/trees/heap-sort-tree", categoryId: "trees" },
  54: { route: "/algo/dp/knapsack", categoryId: "dp" },
  55: { route: "/algo/dp/lcs", categoryId: "dp" },
  56: { route: "/algo/grid/a-star", categoryId: "grid" },
  57: { route: "/algo/grid/flood-fill", categoryId: "grid" },
};

for (const slide of PRESENTATION_SLIDES) {
  const live = LIVE_ROUTES[slide.id];
  if (live) {
    slide.route = live.route;
    slide.categoryId = live.categoryId;
  }
}
