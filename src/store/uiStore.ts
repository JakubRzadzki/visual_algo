import { create } from 'zustand';
import type { VisualizationData, GraphInput } from '../types';

type ActiveMode = 'sorting' | 'searching' | 'graph' | 'grid' | 'dp';

interface UIState {
  theme: 'glacier';
  animationSpeed: number;   // 0.25 to 4.0
  isSidebarOpen: boolean;
  isDebugVisible: boolean;
  
  activeCategory: string; // 'A' through 'F' or catalog id
  activeSortingAlgorithm: string;
  activeSearchingAlgorithm: string;
  activeGraphAlgorithm: string;
  activeGridAlgorithm: string;
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
  setActiveSortingAlgorithm: (algo: string) => void;
  setActiveSearchingAlgorithm: (algo: string) => void;
  setActiveGraphAlgorithm: (algo: string) => void;
  setActiveGridAlgorithm: (algo: string) => void;
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
  activeSearchingAlgorithm: 'Binary Search',
  activeGraphAlgorithm: "Dijkstra's Shortest Path",
  activeGridAlgorithm: "A* Pathfinding",
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
  setActiveSearchingAlgorithm: (algo) => set({ activeSearchingAlgorithm: algo }),
  setActiveGraphAlgorithm: (algo) => set({ activeGraphAlgorithm: algo }),
  setActiveGridAlgorithm: (algo) => set({ activeGridAlgorithm: algo }),
  setActiveMode: (mode) => set({ activeMode: mode }),
  setIsAnimating: (v) => set({ isAnimating: v }),
  
  setVisualizationData: (data) => set({ visualizationData: data }),
  setCurrentGraph: (graph) => set({ currentGraph: graph, visualizationData: graph }),
  
  setIsLoading: (v) => set({ isLoading: v }),
  setShareLink: (link) => set({ shareLink: link }),
}));
