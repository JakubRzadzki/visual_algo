import { create } from 'zustand';

export type AlgorithmType = 'Merge Sort' | 'Quick Sort' | "Dijkstra's Path";

interface UIState {
  theme: 'glacier';
  animationSpeed: number; // 0.25 to 4.0
  isSidebarOpen: boolean;
  isDebugVisible: boolean;
  activeAlgorithm: AlgorithmType;
  setAnimationSpeed: (speed: number) => void;
  toggleSidebar: () => void;
  toggleDebug: () => void;
  setActiveAlgorithm: (algo: AlgorithmType) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'glacier',
  animationSpeed: 1.0,
  isSidebarOpen: true,
  isDebugVisible: false,
  activeAlgorithm: 'Merge Sort',
  
  setAnimationSpeed: (speed) => set({ animationSpeed: Math.max(0.25, Math.min(speed, 4.0)) }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleDebug: () => set((state) => ({ isDebugVisible: !state.isDebugVisible })),
  setActiveAlgorithm: (algo: AlgorithmType) => set({ activeAlgorithm: algo })
}));
