/**
 * Random graph generators for algorithm visualization
 */

import type { GraphInput, GraphNode, GraphEdge } from '../types';

export class GraphGenerator {
  /**
   * Generate a random connected graph using Erdős–Rényi model
   * @param nodeCount Number of nodes (4-20)
   * @param density Edge density (0-1, where 0.3-0.5 is typical)
   */
  static generateRandomGraph(nodeCount: number = 8, density: number = 0.4): GraphInput {
    const nodes: GraphNode[] = Array.from({ length: nodeCount }, (_, i) => ({
      id: `n${i}`,
      label: String(i),
      x: Math.cos((i / nodeCount) * Math.PI * 2) * 200,
      y: Math.sin((i / nodeCount) * Math.PI * 2) * 200,
      vx: 0,
      vy: 0,
    }));

    const edges: GraphEdge[] = [];
    const edgeSet = new Set<string>();

    // Ensure connectivity with a ring
    for (let i = 0; i < nodeCount; i++) {
      const j = (i + 1) % nodeCount;
      const edgeId = `${Math.min(i, j)}-${Math.max(i, j)}`;
      edgeSet.add(edgeId);
      edges.push({
        id: `e${i}-${j}`,
        from: `n${i}`,
        to: `n${j}`,
        weight: Math.floor(Math.random() * 30) + 1,
      });
    }

    // Add random edges based on density
    const maxEdges = (nodeCount * (nodeCount - 1)) / 2;
    const targetEdges = Math.floor(maxEdges * density);

    while (edgeSet.size < targetEdges) {
      const i = Math.floor(Math.random() * nodeCount);
      const j = Math.floor(Math.random() * nodeCount);

      if (i !== j) {
        const edgeId = `${Math.min(i, j)}-${Math.max(i, j)}`;
        if (!edgeSet.has(edgeId)) {
          edgeSet.add(edgeId);
          edges.push({
            id: `e${edgeSet.size}`,
            from: `n${i}`,
            to: `n${j}`,
            weight: Math.floor(Math.random() * 30) + 1,
          });
        }
      }
    }

    return {
      nodes,
      edges,
      startNodeId: `n0`,
    };
  }

  /**
   * Generate a complete weighted graph (all edges present)
   */
  static generateCompleteGraph(nodeCount: number = 6): GraphInput {
    return this.generateRandomGraph(nodeCount, 1.0);
  }

  /**
   * Generate a sparse graph (few edges)
   */
  static generateSparseGraph(nodeCount: number = 10): GraphInput {
    return this.generateRandomGraph(nodeCount, 0.2);
  }

  /**
   * Generate a tree-like graph
   */
  static generateTreeGraph(nodeCount: number = 8): GraphInput {
    const nodes: GraphNode[] = Array.from({ length: nodeCount }, (_, i) => ({
      id: `n${i}`,
      label: String(i),
      x: (i % 4) * 150 - 225,
      y: Math.floor(i / 4) * 150,
      vx: 0,
      vy: 0,
    }));

    const edges: GraphEdge[] = [];
    // Binary tree-like structure
    for (let i = 1; i < nodeCount; i++) {
      const parent = Math.floor((i - 1) / 2);
      edges.push({
        id: `e${i}`,
        from: `n${parent}`,
        to: `n${i}`,
        weight: Math.floor(Math.random() * 20) + 1,
      });
    }

    return {
      nodes,
      edges,
      startNodeId: `n0`,
    };
  }

  /**
   * Generate a grid graph (useful for visual pathfinding)
   */
  static generateGridGraph(width: number = 5, height: number = 5): GraphInput {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    // Create grid nodes
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const id = `n${y * width + x}`;
        nodes.push({
          id,
          label: `${y * width + x}`,
          x: x * 100,
          y: y * 100,
          vx: 0,
          vy: 0,
        });
      }
    }

    // Connect horizontal edges
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width - 1; x++) {
        const from = `n${y * width + x}`;
        const to = `n${y * width + (x + 1)}`;
        edges.push({
          id: `eh${y}-${x}`,
          from,
          to,
          weight: 1,
        });
      }
    }

    // Connect vertical edges
    for (let y = 0; y < height - 1; y++) {
      for (let x = 0; x < width; x++) {
        const from = `n${y * width + x}`;
        const to = `n${(y + 1) * width + x}`;
        edges.push({
          id: `ev${y}-${x}`,
          from,
          to,
          weight: 1,
        });
      }
    }

    return {
      nodes,
      edges,
      startNodeId: `n0`,
    };
  }

  /**
   * Generate a scale-free graph (power-law degree distribution)
   */
  static generateScaleFreeGraph(nodeCount: number = 15): GraphInput {
    const nodes: GraphNode[] = Array.from({ length: nodeCount }, (_, i) => ({
      id: `n${i}`,
      label: String(i),
      x: Math.cos((i / nodeCount) * Math.PI * 2) * 250,
      y: Math.sin((i / nodeCount) * Math.PI * 2) * 250,
      vx: 0,
      vy: 0,
    }));

    const edges: GraphEdge[] = [];
    const degrees: number[] = Array(nodeCount).fill(0);

    // Preferential attachment (Barabási–Albert model)
    for (let i = 2; i < nodeCount; i++) {
      // Connect to 2-3 existing nodes with probability proportional to their degree
      const connectionCount = Math.min(3, i);
      const targetIndices = new Set<number>();

      while (targetIndices.size < connectionCount) {
        const totalDegree = degrees.reduce((a, b) => a + b, 0);
        let random = Math.random() * totalDegree;

        for (let j = 0; j < i; j++) {
          random -= degrees[j];
          if (random <= 0) {
            targetIndices.add(j);
            break;
          }
        }
      }

      for (const j of targetIndices) {
        edges.push({
          id: `e${edges.length}`,
          from: `n${i}`,
          to: `n${j}`,
          weight: Math.floor(Math.random() * 25) + 1,
        });
        degrees[i]++;
        degrees[j]++;
      }
    }

    return {
      nodes,
      edges,
      startNodeId: `n0`,
    };
  }
}
