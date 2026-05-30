import type { GraphInput } from "../../../types";

export function applyTreeLayout(graph: GraphInput): void {
  if (!graph.nodes || graph.nodes.length === 0) return;
  if (graph.layoutHint !== "dagre") return;

  const adj = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const node of graph.nodes) {
    adj.set(node.id, []);
    inDegree.set(node.id, 0);
  }

  // Populate adjacency and in-degrees
  if (graph.edges) {
    for (const edge of graph.edges) {
      if (adj.has(edge.from) && adj.has(edge.to)) {
        adj.get(edge.from)!.push(edge.to);
        inDegree.set(edge.to, inDegree.get(edge.to)! + 1);
      }
    }
  }

  // Find root(s)
  const roots: string[] = [];
  for (const [nodeId, degree] of inDegree.entries()) {
    if (degree === 0) {
      roots.push(nodeId);
    }
  }

  if (roots.length === 0) {
    // Fallback: pick the first node if there's a cycle (shouldn't happen in trees)
    roots.push(graph.nodes[0].id);
  }

  const depths = new Map<string, number>();
  let currentIndex = 0;
  const inOrderIndices = new Map<string, number>();

  // In-order traversal to determine horizontal order (X) and depth (Y)
  function traverse(nodeId: string, depth: number) {
    depths.set(nodeId, depth);
    const children = adj.get(nodeId) || [];
    
    // Left child
    if (children.length > 0) traverse(children[0], depth + 1);
    
    // Self
    if (!inOrderIndices.has(nodeId)) {
        inOrderIndices.set(nodeId, currentIndex++);
    }
    
    // Right child (and any others)
    for (let i = 1; i < children.length; i++) {
      traverse(children[i], depth + 1);
    }
  }

  for (const root of roots) {
    traverse(root, 0);
  }

  const SVG_WIDTH = 800;
  const SVG_HEIGHT = 600;
  const paddingX = 60;
  const paddingY = 80;
  
  const totalNodes = currentIndex;
  const maxDepth = Math.max(0, ...Array.from(depths.values()));

  const stepX = totalNodes > 1 ? (SVG_WIDTH - 2 * paddingX) / (totalNodes - 1) : 0;
  const stepY = maxDepth > 0 ? (SVG_HEIGHT - 2 * paddingY) / maxDepth : 0;

  for (const node of graph.nodes) {
    const idx = inOrderIndices.get(node.id) || 0;
    const d = depths.get(node.id) || 0;
    
    node.x = totalNodes === 1 ? SVG_WIDTH / 2 : paddingX + idx * stepX;
    node.y = paddingY + d * Math.min(stepY, 120); // Cap vertical spacing
  }
}
