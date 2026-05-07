import type { TreeNode, AnimationStep } from '../types/tree';

const genId = () => crypto.randomUUID();

export function deepClone(node: TreeNode | null): TreeNode | null {
  if (!node) return null;
  return {
    ...node,
    left: deepClone(node.left),
    right: deepClone(node.right),
  };
}

export function bstInsert(
  root: TreeNode | null,
  value: number
): AnimationStep[] {
  const steps: AnimationStep[] = [];
  let treeCopy = deepClone(root);
  const path: string[] = [];

  function insertRec(node: TreeNode | null, parent: TreeNode | null): TreeNode {
    if (node === null) {
      const newNode: TreeNode = { id: genId(), value, left: null, right: null };

      if (parent) {
        if (value < parent.value) parent.left = newNode;
        else parent.right = newNode;
      } else {
        treeCopy = newNode;
      }

      steps.push({
        type: 'INSERT',
        nodeIds: [newNode.id],
        description: `Inserting ${value} as a new node`,
        treeSnapshot: deepClone(treeCopy),
      });

      return newNode;
    }

    path.push(node.id);
    steps.push({
      type: 'VISIT',
      nodeIds: [node.id],
      edgeIds: path.length > 1 ? [`${path[path.length - 2]}-${node.id}`] : [],
      description: `Visiting node ${node.value}`,
      treeSnapshot: deepClone(treeCopy),
    });

    steps.push({
      type: 'COMPARE',
      nodeIds: [node.id],
      description: `${value} ${value < node.value ? '<' : '>='} ${node.value} → going ${value < node.value ? 'left' : 'right'}`,
      treeSnapshot: deepClone(treeCopy),
    });

    if (value < node.value) {
      node.left = insertRec(node.left, node);
    } else if (value > node.value) {
      node.right = insertRec(node.right, node);
    }

    return node;
  }

  insertRec(treeCopy, null);
  return steps;
}
