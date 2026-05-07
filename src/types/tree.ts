// src/types/tree.ts
export interface TreeNode {
  id: string;
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
  x?: number;
  y?: number;
}

export interface AVLNode extends TreeNode {
  height: number;
  balanceFactor: number;
}

export interface RBNode extends TreeNode {
  color: 'RED' | 'BLACK';
  parent: RBNode | null;
}

export interface TrieNode {
  id: string;
  char: string;
  children: Map<string, TrieNode>;
  isEndOfWord: boolean;
  x?: number;
  y?: number;
}

export interface AnimationStep {
  type: 'VISIT' | 'COMPARE' | 'INSERT' | 'DELETE' | 'ROTATE' | 'RECOLOR' | 'PATH';
  nodeIds: string[];
  edgeIds?: string[];
  description: string;
  treeSnapshot: TreeNode | null;
}
