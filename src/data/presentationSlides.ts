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
        ["", "", "Topological Sort", "", "", ""],
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

  // ── 13. React re-render trap ─────────────────────────────
  {
    id: 13,
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
    id: 14,
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
    id: 15,
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
    id: 16,
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
    id: 17,
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
    id: 18,
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
    id: 19,
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
    id: 20,
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
    id: 21,
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

  // ── 22–40. Galeria algorytmów ────────────────────────────
  {
    id: 22,
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
    id: 23,
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
    id: 24,
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
    id: 25,
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
    id: 26,
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
    id: 27,
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
    id: 28,
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
    id: 29,
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
    id: 30,
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
    id: 31,
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
    id: 32,
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
    id: 33,
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
    id: 34,
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
    id: 35,
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
    id: 36,
    variant: "content",
    kicker: "Drzewa",
    title: "AVL — rotacje",
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
    id: 37,
    variant: "content",
    kicker: "Drzewa",
    title: "Red-Black Tree — fix-up",
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
    id: 38,
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
    id: 39,
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
  {
    id: 40,
    variant: "content",
    kicker: "Programowanie dynamiczne",
    title: "Knapsack i LCS",
    complexity: "O(n·W) / O(m·n)",
    code: {
      language: "typescript",
      filePath: "src/core/plugins/dp/KnapsackDPPlugin.ts",
      code: `// 0/1 Knapsack — tablica dp[i][w]
for (let i = 1; i <= n; i++)
  for (let w = 1; w <= W; w++)
    dp[i][w] = wt[i - 1] <= w
      ? Math.max(dp[i - 1][w], val[i - 1] + dp[i - 1][w - wt[i - 1]])
      : dp[i - 1][w];`,
      caption: "Knapsack O(n·W); LCS O(m·n) — emitowane jako MATRIX_CELL_UPDATE.",
    },
  },

  // ── 41. Zakończenie ──────────────────────────────────────
  {
    id: 41,
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
const LIVE_ROUTES: Record<number, { route: string; categoryId: string }> = {
  22: { route: "/algo/sorting/bubble-sort", categoryId: "sorting" },
  23: { route: "/algo/sorting/merge-sort", categoryId: "sorting" },
  24: { route: "/algo/sorting/quick-sort", categoryId: "sorting" },
  25: { route: "/algo/sorting/heap-sort", categoryId: "sorting" },
  26: { route: "/algo/searching/linear-search", categoryId: "searching" },
  27: { route: "/algo/searching/binary-search", categoryId: "searching" },
  28: { route: "/algo/graphs/bfs", categoryId: "graphs" },
  29: { route: "/algo/graphs/dfs", categoryId: "graphs" },
  30: { route: "/algo/graphs/dijkstra", categoryId: "graphs" },
  31: { route: "/algo/graphs/kruskal", categoryId: "graphs" },
  32: { route: "/algo/graphs/prim", categoryId: "graphs" },
  33: { route: "/algo/graphs/topo-sort", categoryId: "graphs" },
  34: { route: "/algo/trees/binary", categoryId: "trees" },
  35: { route: "/algo/trees/bst", categoryId: "trees" },
  36: { route: "/algo/trees/avl", categoryId: "trees" },
  37: { route: "/algo/trees/rbt", categoryId: "trees" },
  38: { route: "/algo/grid/a-star", categoryId: "grid" },
  39: { route: "/algo/grid/flood-fill", categoryId: "grid" },
  40: { route: "/algo/dp/knapsack", categoryId: "dp" },
};

for (const slide of PRESENTATION_SLIDES) {
  const live = LIVE_ROUTES[slide.id];
  if (live) {
    slide.route = live.route;
    slide.categoryId = live.categoryId;
  }
}
