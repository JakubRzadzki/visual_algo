import * as d3 from 'd3';
import type { TreeNode } from '../types/tree';

export function computeLayoutD3(root: TreeNode | null): Map<string, { x: number; y: number }> {
  if (!root) return new Map();

  // Convert custom structure to d3 format
  function toD3(node: TreeNode): d3.HierarchyNode<TreeNode> {
    return d3.hierarchy(node, (d) => {
      const children: TreeNode[] = [];
      if (d.left) children.push(d.left);
      if (d.right) children.push(d.right);
      // Ensure the array matches what d3 expects (or return undefined if empty)
      return children.length ? children : null;
    });
  }

  const hierarchy = toD3(root);
  const treeLayout = d3.tree<TreeNode>()
    .nodeSize([80, 100]) // [horizontal, vertical] spacing
    .separation((a, b) => (a.parent === b.parent ? 1 : 1.5));

  treeLayout(hierarchy);

  const positions = new Map<string, { x: number; y: number }>();
  hierarchy.each((node) => {
    // d3.tree gives x as horizontal, y as vertical (depth)
    // d3-hierarchy 3.x+ returns x/y correctly for standard top-down if using d3.tree()
    positions.set(node.data.id, { x: node.x || 0, y: node.y || 0 });
  });

  return positions;
}

// Flatten tree to get all nodes and edges
export function flattenTree(root: TreeNode | null) {
  const nodes: TreeNode[] = [];
  const edges: { fromId: string; toId: string }[] = [];

  function traverse(node: TreeNode | null) {
    if (!node) return;
    nodes.push(node);
    if (node.left) {
      edges.push({ fromId: node.id, toId: node.left.id });
      traverse(node.left);
    }
    if (node.right) {
      edges.push({ fromId: node.id, toId: node.right.id });
      traverse(node.right);
    }
  }

  traverse(root);
  return { nodes, edges };
}
