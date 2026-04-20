import { create } from 'zustand';
import type { GraphInput } from '../types';

export type AlgorithmType = 'Merge Sort' | 'Quick Sort' | "Dijkstra's Path" | "Kruskal's MST";
type ActiveMode = 'sorting' | 'graph';

interface UIState {
  theme: 'glacier';
  animationSpeed: number;   // 0.25 to 4.0
  isSidebarOpen: boolean;
  isDebugVisible: boolean;
  activeAlgorithm: AlgorithmType;
  activeMode: ActiveMode;   // which visualisation stage is shown
  isAnimating: boolean;     // true while engine is playing back a trace
  currentGraph: GraphInput | null;  // currently displayed graph
  setAnimationSpeed: (speed: number) => void;
  toggleSidebar: () => void;
  toggleDebug: () => void;
  setActiveAlgorithm: (algo: AlgorithmType) => void;
  setActiveMode: (mode: ActiveMode) => void;
  setIsAnimating: (v: boolean) => void;
  setCurrentGraph: (graph: GraphInput) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'glacier',
  animationSpeed: 1.0,
  isSidebarOpen: true,
  isDebugVisible: false,
  activeAlgorithm: 'Merge Sort',
  activeMode: 'sorting',
  isAnimating: false,
  currentGraph: null,

  setAnimationSpeed: (speed) => set({ animationSpeed: Math.max(0.25, Math.min(speed, 4.0)) }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleDebug: () => set((state) => ({ isDebugVisible: !state.isDebugVisible })),
  setActiveAlgorithm: (algo: AlgorithmType) => set({ activeAlgorithm: algo }),
  setActiveMode: (mode) => set({ activeMode: mode }),
  setIsAnimating: (v) => set({ isAnimating: v }),
  setCurrentGraph: (graph) => set({ currentGraph: graph }),
}));
