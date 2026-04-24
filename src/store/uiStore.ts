import { create } from 'zustand';
import type { VisualizationData, GraphInput } from '../types';

export type AlgorithmType = 'Merge Sort' | 'Quick Sort' | "Dijkstra's Path" | "Kruskal's MST";
type ActiveMode = 'sorting' | 'graph';

interface UIState {
  theme: 'glacier';
  animationSpeed: number;   // 0.25 to 4.0
  isSidebarOpen: boolean;
  isDebugVisible: boolean;
  
  activeCategory: string; // 'A' through 'F' or catalog id
  activeSortingAlgorithm: 'Merge Sort' | 'Quick Sort';
  activeGraphAlgorithm: "Dijkstra's Path" | "Kruskal's MST";
  activeMode: ActiveMode;   // which visualisation stage is shown
  isAnimating: boolean;     // true while engine is playing back a trace
  
  visualizationData: VisualizationData | null;  // Polymorphic active data payload
  currentGraph: GraphInput | null; // legacy alias until fully migrated
  
  isLoading: boolean;       // for backend requests
  shareLink: string;        // UUID of saved snapshot

  setAnimationSpeed: (speed: number) => void;
  toggleSidebar: () => void;
  toggleDebug: () => void;
  
  setActiveCategory: (cat: string) => void;
  setActiveSortingAlgorithm: (algo: 'Merge Sort' | 'Quick Sort') => void;
  setActiveGraphAlgorithm: (algo: "Dijkstra's Path" | "Kruskal's MST") => void;
  setActiveMode: (mode: ActiveMode) => void;
  setIsAnimating: (v: boolean) => void;
  
  setVisualizationData: (data: VisualizationData) => void;
  setCurrentGraph: (graph: GraphInput) => void; // legacy support
  
  setIsLoading: (v: boolean) => void;
  setShareLink: (link: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'glacier',
  animationSpeed: 1.0,
  isSidebarOpen: true,
  isDebugVisible: false,
  
  activeCategory: 'sorting',
  activeSortingAlgorithm: 'Merge Sort',
  activeGraphAlgorithm: "Dijkstra's Path",
  activeMode: 'sorting',
  isAnimating: false,
  
  visualizationData: null,
  currentGraph: null,
  
  isLoading: false,
  shareLink: '',

  setAnimationSpeed: (speed) => set({ animationSpeed: Math.max(0.25, Math.min(speed, 4.0)) }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleDebug: () => set((state) => ({ isDebugVisible: !state.isDebugVisible })),
  
  setActiveCategory: (cat) => set({ activeCategory: cat }),
  setActiveSortingAlgorithm: (algo) => set({ activeSortingAlgorithm: algo }),
  setActiveGraphAlgorithm: (algo) => set({ activeGraphAlgorithm: algo }),
  setActiveMode: (mode) => set({ activeMode: mode }),
  setIsAnimating: (v) => set({ isAnimating: v }),
  
  setVisualizationData: (data) => set({ visualizationData: data }),
  setCurrentGraph: (graph) => set({ currentGraph: graph, visualizationData: graph }),
  
  setIsLoading: (v) => set({ isLoading: v }),
  setShareLink: (link) => set({ shareLink: link }),
}));
