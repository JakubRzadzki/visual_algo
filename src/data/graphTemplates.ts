import type { GraphInput, GraphNode, GraphEdge } from "../types";

// Helper to construct a node
const n = (id: string, label: string, x: number, y: number): GraphNode => ({
  id,
  label,
  x,
  y,
  vx: 0,
  vy: 0,
});

// Helper to construct an edge
const e = (
  id: string,
  from: string,
  to: string,
  weight: number,
): GraphEdge => ({
  id,
  from,
  to,
  weight,
});

export interface GraphTemplate {
  id: string;
  name: string;
  graph: GraphInput;
}

export const GRAPH_TEMPLATES: Record<string, GraphTemplate[]> = {
  dijkstra: [
    {
      id: "dijkstra-simple",
      name: "Variation 1: Simple Shortest Path",
      graph: {
        nodes: [
          n("n0", "0", -120, -60),
          n("n1", "1", 0, -120),
          n("n2", "2", 0, 0),
          n("n3", "3", 120, -60),
        ],
        edges: [
          e("e0", "n0", "n1", 2),
          e("e1", "n0", "n2", 4),
          e("e2", "n1", "n2", 1),
          e("e3", "n1", "n3", 5),
          e("e4", "n2", "n3", 2),
        ],
        startNodeId: "n0",
        isDirected: true,
      },
    },
    {
      id: "dijkstra-medium",
      name: "Variation 2: Disjoint Paths",
      graph: {
        nodes: [
          n("n0", "0", -150, -40),
          n("n1", "1", -30, -120),
          n("n2", "2", -30, 40),
          n("n3", "3", 90, -120),
          n("n4", "4", 90, 40),
        ],
        edges: [
          e("e0", "n0", "n1", 3),
          e("e1", "n0", "n2", 5),
          e("e2", "n1", "n3", 2),
          e("e3", "n2", "n4", 6),
          e("e4", "n3", "n4", 1),
          e("e5", "n1", "n4", 8),
        ],
        startNodeId: "n0",
        isDirected: true,
      },
    },
    {
      id: "dijkstra-complex",
      name: "Variation 3: Multiple Routes",
      graph: {
        nodes: [
          n("n0", "0", -180, 0),
          n("n1", "1", -60, -90),
          n("n2", "2", -60, 90),
          n("n3", "3", 60, -90),
          n("n4", "4", 60, 90),
          n("n5", "5", 180, 0),
        ],
        edges: [
          e("e0", "n0", "n1", 2),
          e("e1", "n0", "n2", 4),
          e("e2", "n1", "n3", 4),
          e("e3", "n1", "n2", 1),
          e("e4", "n2", "n4", 3),
          e("e5", "n3", "n5", 2),
          e("e6", "n4", "n3", 1),
          e("e7", "n4", "n5", 5),
        ],
        startNodeId: "n0",
        isDirected: true,
      },
    },
  ],
  kruskal: [
    {
      id: "kruskal-simple",
      name: "Variation 1: Minimal Graph",
      graph: {
        nodes: [
          n("n0", "0", -100, -60),
          n("n1", "1", 100, -60),
          n("n2", "2", -100, 60),
          n("n3", "3", 100, 60),
        ],
        edges: [
          e("e0", "n0", "n1", 1),
          e("e1", "n1", "n3", 2),
          e("e2", "n2", "n3", 4),
          e("e3", "n0", "n2", 3),
          e("e4", "n0", "n3", 5),
        ],
        startNodeId: "n0",
        isDirected: false,
      },
    },
    {
      id: "kruskal-medium",
      name: "Variation 2: Cycle Testing",
      graph: {
        nodes: [
          n("n0", "0", -140, -40),
          n("n1", "1", 0, -120),
          n("n2", "2", 0, 40),
          n("n3", "3", 140, -40),
          n("n4", "4", 0, -40),
        ],
        edges: [
          e("e0", "n0", "n1", 2),
          e("e1", "n1", "n3", 3),
          e("e2", "n0", "n2", 4),
          e("e3", "n2", "n3", 5),
          e("e4", "n1", "n4", 1),
          e("e5", "n4", "n2", 6),
        ],
        startNodeId: "n0",
        isDirected: false,
      },
    },
    {
      id: "kruskal-dense",
      name: "Variation 3: Dense Undirected",
      graph: {
        nodes: [
          n("n0", "0", -160, 0),
          n("n1", "1", -60, -90),
          n("n2", "2", -60, 90),
          n("n3", "3", 60, -90),
          n("n4", "4", 60, 90),
          n("n5", "5", 160, 0),
        ],
        edges: [
          e("e0", "n0", "n1", 4),
          e("e1", "n0", "n2", 2),
          e("e2", "n1", "n2", 3),
          e("e3", "n1", "n3", 1),
          e("e4", "n2", "n4", 5),
          e("e5", "n3", "n4", 2),
          e("e6", "n3", "n5", 6),
          e("e7", "n4", "n5", 4),
        ],
        startNodeId: "n0",
        isDirected: false,
      },
    },
  ],
  prim: [
    {
      id: "prim-simple",
      name: "Variation 1: 4-Node Network",
      graph: {
        nodes: [
          n("n0", "0", -100, -60),
          n("n1", "1", 100, -60),
          n("n2", "2", -100, 60),
          n("n3", "3", 100, 60),
        ],
        edges: [
          e("e0", "n0", "n1", 2),
          e("e1", "n1", "n3", 1),
          e("e2", "n2", "n3", 4),
          e("e3", "n0", "n2", 3),
          e("e4", "n1", "n2", 5),
        ],
        startNodeId: "n0",
        isDirected: false,
      },
    },
    {
      id: "prim-medium",
      name: "Variation 2: Vertex Priority test",
      graph: {
        nodes: [
          n("n0", "0", -140, -40),
          n("n1", "1", 0, -120),
          n("n2", "2", 0, 40),
          n("n3", "3", 140, -40),
          n("n4", "4", 0, -40),
        ],
        edges: [
          e("e0", "n0", "n1", 4),
          e("e1", "n1", "n3", 2),
          e("e2", "n0", "n2", 1),
          e("e3", "n2", "n3", 5),
          e("e4", "n1", "n4", 3),
          e("e5", "n4", "n2", 2),
        ],
        startNodeId: "n0",
        isDirected: false,
      },
    },
    {
      id: "prim-dense",
      name: "Variation 3: Complex Graph",
      graph: {
        nodes: [
          n("n0", "0", -160, 0),
          n("n1", "1", -60, -90),
          n("n2", "2", -60, 90),
          n("n3", "3", 60, -90),
          n("n4", "4", 60, 90),
          n("n5", "5", 160, 0),
        ],
        edges: [
          e("e0", "n0", "n1", 2),
          e("e1", "n0", "n2", 5),
          e("e2", "n1", "n2", 1),
          e("e3", "n1", "n3", 4),
          e("e4", "n2", "n4", 3),
          e("e5", "n3", "n4", 1),
          e("e6", "n3", "n5", 6),
          e("e7", "n4", "n5", 2),
        ],
        startNodeId: "n0",
        isDirected: false,
      },
    },
  ],
  bfs: [
    {
      id: "bfs-simple",
      name: "Variation 1: Binary Tree Layout",
      graph: {
        nodes: [
          n("n0", "0", 0, -120),
          n("n1", "1", -100, -20),
          n("n2", "2", 100, -20),
          n("n3", "3", -150, 80),
          n("n4", "4", -50, 80),
        ],
        edges: [
          e("e0", "n0", "n1", 1),
          e("e1", "n0", "n2", 1),
          e("e2", "n1", "n3", 1),
          e("e3", "n1", "n4", 1),
        ],
        startNodeId: "n0",
        isDirected: true,
      },
    },
    {
      id: "bfs-cycle",
      name: "Variation 2: Cyclic DAG traversal",
      graph: {
        nodes: [
          n("n0", "0", -140, 0),
          n("n1", "1", -30, -90),
          n("n2", "2", -30, 90),
          n("n3", "3", 80, -90),
          n("n4", "4", 80, 90),
        ],
        edges: [
          e("e0", "n0", "n1", 1),
          e("e1", "n0", "n2", 1),
          e("e2", "n1", "n3", 1),
          e("e3", "n2", "n4", 1),
          e("e4", "n3", "n4", 1),
          e("e5", "n1", "n4", 1),
        ],
        startNodeId: "n0",
        isDirected: true,
      },
    },
    {
      id: "bfs-grid",
      name: "Variation 3: 6-Node Grid-like",
      graph: {
        nodes: [
          n("n0", "0", -150, -60),
          n("n1", "1", 0, -120),
          n("n2", "2", 150, -60),
          n("n3", "3", -150, 60),
          n("n4", "4", 0, 120),
          n("n5", "5", 150, 60),
        ],
        edges: [
          e("e0", "n0", "n1", 1),
          e("e1", "n1", "n2", 1),
          e("e2", "n0", "n3", 1),
          e("e3", "n1", "n4", 1),
          e("e4", "n2", "n5", 1),
          e("e5", "n3", "n4", 1),
          e("e6", "n4", "n5", 1),
        ],
        startNodeId: "n0",
        isDirected: true,
      },
    },
  ],
  dfs: [
    {
      id: "dfs-linear",
      name: "Variation 1: Simple Path",
      graph: {
        nodes: [
          n("n0", "0", -120, -60),
          n("n1", "1", 0, -120),
          n("n2", "2", 0, 0),
          n("n3", "3", 120, -60),
        ],
        edges: [
          e("e0", "n0", "n1", 1),
          e("e1", "n1", "n2", 1),
          e("e2", "n2", "n3", 1),
          e("e3", "n0", "n3", 1),
        ],
        startNodeId: "n0",
        isDirected: true,
      },
    },
    {
      id: "dfs-branches",
      name: "Variation 2: Deep Branching",
      graph: {
        nodes: [
          n("n0", "0", -150, -40),
          n("n1", "1", -30, -120),
          n("n2", "2", -30, 40),
          n("n3", "3", 90, -120),
          n("n4", "4", 90, 40),
        ],
        edges: [
          e("e0", "n0", "n1", 1),
          e("e1", "n1", "n2", 1),
          e("e2", "n0", "n3", 1),
          e("e3", "n3", "n4", 1),
          e("e4", "n2", "n4", 1),
        ],
        startNodeId: "n0",
        isDirected: true,
      },
    },
    {
      id: "dfs-cyclic",
      name: "Variation 3: Cycles",
      graph: {
        nodes: [
          n("n0", "0", -160, 0),
          n("n1", "1", -60, -90),
          n("n2", "2", -60, 90),
          n("n3", "3", 60, -90),
          n("n4", "4", 60, 90),
          n("n5", "5", 160, 0),
        ],
        edges: [
          e("e0", "n0", "n1", 1),
          e("e1", "n1", "n2", 1),
          e("e2", "n2", "n0", 1),
          e("e3", "n1", "n3", 1),
          e("e4", "n2", "n4", 1),
          e("e5", "n3", "n5", 1),
          e("e6", "n4", "n5", 1),
        ],
        startNodeId: "n0",
        isDirected: true,
      },
    },
  ],
  "topo-sort": [
    {
      id: "topo-simple",
      name: "Variation 1: 4-Node Chain",
      graph: {
        nodes: [
          n("n0", "0", -100, -60),
          n("n1", "1", 100, -60),
          n("n2", "2", -100, 60),
          n("n3", "3", 100, 60),
        ],
        edges: [
          e("e0", "n0", "n1", 1),
          e("e1", "n1", "n3", 1),
          e("e2", "n2", "n3", 1),
          e("e3", "n0", "n2", 1),
        ],
        startNodeId: "n0",
        isDirected: true,
      },
    },
    {
      id: "topo-medium",
      name: "Variation 2: Directed Acyclic Graph",
      graph: {
        nodes: [
          n("n0", "0", -140, -40),
          n("n1", "1", 0, -120),
          n("n2", "2", 0, 40),
          n("n3", "3", 140, -40),
          n("n4", "4", 0, -40),
        ],
        edges: [
          e("e0", "n0", "n1", 1),
          e("e1", "n0", "n2", 1),
          e("e2", "n1", "n3", 1),
          e("e3", "n2", "n4", 1),
          e("e4", "n4", "n3", 1),
        ],
        startNodeId: "n0",
        isDirected: true,
      },
    },
    {
      id: "topo-complex",
      name: "Variation 3: Advanced Dependencies",
      graph: {
        nodes: [
          n("n0", "0", -160, 0),
          n("n1", "1", -60, -90),
          n("n2", "2", -60, 90),
          n("n3", "3", 60, -90),
          n("n4", "4", 60, 90),
          n("n5", "5", 160, 0),
        ],
        edges: [
          e("e0", "n0", "n1", 1),
          e("e1", "n0", "n2", 1),
          e("e2", "n1", "n3", 1),
          e("e3", "n2", "n4", 1),
          e("e4", "n3", "n5", 1),
          e("e5", "n4", "n5", 1),
          e("e6", "n1", "n4", 1),
        ],
        startNodeId: "n0",
        isDirected: true,
      },
    },
  ],
};
