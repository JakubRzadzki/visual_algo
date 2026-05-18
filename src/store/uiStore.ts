import { create } from "zustand";
import type { VisualizationData, GraphInput } from "../types";

type ActiveMode = "sorting" | "searching" | "graph" | "grid" | "dp" | "tree";

interface UIState {
  theme: "dark" | "light";
  animationSpeed: number; // 0.25 to 4.0
  isSidebarOpen: boolean;
  isDebugVisible: boolean;

  activeCategory: string; // 'sorting', 'searching', etc.
  activeSortingAlgorithm: string;
  activeSearchingAlgorithm: string;
  activeGraphAlgorithm: string;
  activeGridAlgorithm: string;
  activeDPAlgorithm: string;
  activeMode: ActiveMode; // which visualisation stage is shown
  isAnimating: boolean; // true while engine is playing back a trace

  visualizationData: VisualizationData | null; // Polymorphic active data payload
  currentGraph: GraphInput | null; // legacy alias until fully migrated

  isLoading: boolean; // for backend requests
  shareLink: string; // UUID of saved snapshot
  isCodePanelOpen: boolean; // toggle right aside code & terminal pane
  language: "en" | "pl";

  setAnimationSpeed: (speed: number) => void;
  toggleSidebar: () => void;
  toggleDebug: () => void;
  toggleCodePanel: () => void;
  setLanguage: (lang: "en" | "pl") => void;
  toggleTheme: () => void;

  setActiveCategory: (cat: string) => void;
  setActiveSortingAlgorithm: (algo: string) => void;
  setActiveSearchingAlgorithm: (algo: string) => void;
  setActiveGraphAlgorithm: (algo: string) => void;
  setActiveGridAlgorithm: (algo: string) => void;
  setActiveDPAlgorithm: (algo: string) => void;
  setActiveMode: (mode: ActiveMode) => void;
  setIsAnimating: (v: boolean) => void;

  setVisualizationData: (data: VisualizationData) => void;
  setCurrentGraph: (graph: GraphInput) => void; // legacy support

  setIsLoading: (v: boolean) => void;
  setShareLink: (link: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme:
    (localStorage.getItem("visual-algo-theme") as "dark" | "light") || "dark",
  animationSpeed: 1.0,
  isSidebarOpen: true,
  isDebugVisible: false,
  isCodePanelOpen: true,

  activeCategory: "sorting",
  activeSortingAlgorithm: "Merge Sort",
  activeSearchingAlgorithm: "Binary Search",
  activeGraphAlgorithm: "Dijkstra's Shortest Path",
  activeGridAlgorithm: "A* Pathfinding",
  activeDPAlgorithm: "0/1 Knapsack",
  activeMode: "sorting",
  isAnimating: false,

  visualizationData: null,
  currentGraph: null,

  isLoading: false,
  shareLink: "",
  language: (localStorage.getItem("visual-algo-lang") as "en" | "pl") || "en",

  setAnimationSpeed: (speed) =>
    set({ animationSpeed: Math.max(0.25, Math.min(speed, 4.0)) }),
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleDebug: () =>
    set((state) => ({ isDebugVisible: !state.isDebugVisible })),
  toggleCodePanel: () =>
    set((state) => ({ isCodePanelOpen: !state.isCodePanelOpen })),

  setActiveCategory: (cat) => set({ activeCategory: cat }),
  setActiveSortingAlgorithm: (algo) => set({ activeSortingAlgorithm: algo }),
  setActiveSearchingAlgorithm: (algo) =>
    set({ activeSearchingAlgorithm: algo }),
  setActiveGraphAlgorithm: (algo) => set({ activeGraphAlgorithm: algo }),
  setActiveGridAlgorithm: (algo) => set({ activeGridAlgorithm: algo }),
  setActiveDPAlgorithm: (algo) => set({ activeDPAlgorithm: algo }),
  setActiveMode: (mode) => set({ activeMode: mode }),
  setIsAnimating: (v) => set({ isAnimating: v }),

  setVisualizationData: (data) => set({ visualizationData: data }),
  setCurrentGraph: (graph) =>
    set({ currentGraph: graph, visualizationData: graph }),

  setIsLoading: (v) => set({ isLoading: v }),
  setShareLink: (link) => set({ shareLink: link }),
  setLanguage: (lang) => {
    localStorage.setItem("visual-algo-lang", lang);
    set({ language: lang });
  },
  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === "dark" ? "light" : "dark";
      localStorage.setItem("visual-algo-theme", newTheme);

      // Apply class to body for global CSS targeting
      if (newTheme === "light") {
        document.body.classList.add("light-mode");
      } else {
        document.body.classList.remove("light-mode");
      }

      return { theme: newTheme };
    }),
}));
