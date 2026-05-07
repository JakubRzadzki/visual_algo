import { create } from 'zustand';
import type { TreeNode, AnimationStep } from '../types/tree';
import { computeLayoutD3 } from '../utils/treeLayout';

export type TreeType = 'BT' | 'BST' | 'AVL' | 'RB' | 'TRIE' | 'binary' | 'bst' | 'avl' | 'rbt' | 'trie';

interface TreeStore {
  root: TreeNode | null;
  activeTreeType: TreeType;

  steps: AnimationStep[];
  currentStepIndex: number;
  isPlaying: boolean;
  speed: number;

  nodePositions: Map<string, { x: number; y: number }>;

  // Actions
  setTreeType: (type: TreeType) => void;
  insert: (value: number) => void;
  setSteps: (steps: AnimationStep[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  play: () => void;
  pause: () => void;
  reset: () => void;
  setSpeed: (ms: number) => void;
}

// Generate the hardcoded tree from arr = [15, 10, 20, 8, 12, 17, 25]
const initialNodes: TreeNode = {
  id: 'node-15',
  value: 15,
  left: { 
    id: 'node-10', 
    value: 10, 
    left: { id: 'node-8', value: 8, left: null, right: null }, 
    right: { id: 'node-12', value: 12, left: null, right: null } 
  },
  right: { 
    id: 'node-20', 
    value: 20, 
    left: { id: 'node-17', value: 17, left: null, right: null }, 
    right: { id: 'node-25', value: 25, left: null, right: null } 
  }
};

export const useTreeStore = create<TreeStore>((set, get) => ({
  root: initialNodes,
  activeTreeType: 'BST',

  steps: [],
  currentStepIndex: 0,
  isPlaying: false,
  speed: 600,

  nodePositions: computeLayoutD3(initialNodes),

  setTreeType: (type) => set({ activeTreeType: type }),

  setSteps: (steps) => {
    set({
      steps,
      currentStepIndex: 0,
      isPlaying: true,
      nodePositions: steps[0]?.treeSnapshot ? computeLayoutD3(steps[0].treeSnapshot) : get().nodePositions
    });
  },

  insert: () => {}, // Hardcoded, insert disabled

  nextStep: () => {
    const { currentStepIndex, steps } = get();
    if (currentStepIndex < steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      const snapshot = steps[nextIdx].treeSnapshot;
      set({ 
        currentStepIndex: nextIdx,
        nodePositions: snapshot ? computeLayoutD3(snapshot) : get().nodePositions
      });
    } else {
      set({ isPlaying: false });
    }
  },

  prevStep: () => {
    const { currentStepIndex, steps } = get();
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      const snapshot = steps[prevIdx].treeSnapshot;
      set({ 
        currentStepIndex: prevIdx,
        nodePositions: snapshot ? computeLayoutD3(snapshot) : get().nodePositions
      });
    }
  },

  play: () => {
    if (get().currentStepIndex >= get().steps.length - 1) {
      set({ currentStepIndex: 0 });
    }
    set({ isPlaying: true });
  },

  pause: () => set({ isPlaying: false }),

  reset: () => set({ steps: [], currentStepIndex: 0, isPlaying: false }),

  setSpeed: (speed) => set({ speed }),
}));
