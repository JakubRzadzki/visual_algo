import type { GraphInput, GraphNode, GraphEdge } from "../types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Construct a graph node for an 800×600 SVG viewBox. */
const n = (id: string, label: string, x: number, y: number): GraphNode => ({
  id,
  label,
  x,
  y,
  vx: 0,
  vy: 0,
});

/** Construct a weighted edge. */
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

// ─── Public Types ─────────────────────────────────────────────────────────────

export interface GraphTemplate {
  id: string;
  name: string;
  graph: GraphInput;
}

// ─── Templates ────────────────────────────────────────────────────────────────
//
// All coordinates target an 800×600 SVG viewBox.
//
// Template families:
//   dijkstra  — Pathfinding (directed L→R, decoy heavy path + correct shortest)
//   kruskal   — MST dense hub-and-spoke (undirected)
//   prim      — Shares kruskal topology (undirected)
//   bfs       — Search/Tree (directed, top-down)
//   dfs       — Shares bfs topology (directed)
//   topo-sort — Shares bfs topology (directed, DAG)
// ──────────────────────────────────────────────────────────────────────────────

export const GRAPH_TEMPLATES: Record<string, GraphTemplate[]> = {
  // ────────────────────────────────────────────────────────────────────────────
  // PATHFINDING — Dijkstra
  // Directed left-to-right. 8 nodes. One decoy path (huge weight 99).
  // ────────────────────────────────────────────────────────────────────────────
  dijkstra: [
    {
      id: "dijkstra-trap",
      name: "Variation 1: Decoy Trap",
      graph: {
        nodes: [
          n("n0", "S", 80, 300),
          n("n1", "A", 220, 150),
          n("n2", "B", 220, 450),
          n("n3", "C", 400, 100),
          n("n4", "D", 400, 300),
          n("n5", "E", 400, 500),
          n("n6", "F", 580, 250),
          n("n7", "T", 720, 300),
        ],
        edges: [
          // Upper route (correct shortest: S→A→C→F→T = 2+3+2+2 = 9)
          e("e0", "n0", "n1", 2),
          e("e1", "n1", "n3", 3),
          e("e2", "n3", "n6", 2),
          e("e3", "n6", "n7", 2),
          // Decoy direct: S→D→T looks short (2 edges) but costs 99
          e("e4", "n0", "n4", 5),
          e("e5", "n4", "n7", 99),
          // Lower route (long)
          e("e6", "n0", "n2", 4),
          e("e7", "n2", "n5", 6),
          e("e8", "n5", "n7", 8),
          // Cross links
          e("e9", "n1", "n4", 4),
          e("e10", "n4", "n6", 3),
          e("e11", "n2", "n4", 7),
        ],
        startNodeId: "n0",
        isDirected: true,
      },
    },
    {
      id: "dijkstra-diamond",
      name: "Variation 2: Diamond Network",
      graph: {
        nodes: [
          n("n0", "S", 80, 300),
          n("n1", "A", 250, 140),
          n("n2", "B", 250, 460),
          n("n3", "C", 400, 300),
          n("n4", "D", 550, 140),
          n("n5", "E", 550, 460),
          n("n6", "T", 720, 300),
        ],
        edges: [
          e("e0", "n0", "n1", 3),
          e("e1", "n0", "n2", 7),
          e("e2", "n1", "n3", 2),
          e("e3", "n2", "n3", 1),
          e("e4", "n3", "n4", 4),
          e("e5", "n3", "n5", 5),
          e("e6", "n4", "n6", 3),
          e("e7", "n5", "n6", 2),
          e("e8", "n1", "n4", 10),
          e("e9", "n2", "n5", 3),
        ],
        startNodeId: "n0",
        isDirected: true,
      },
    },
    {
      id: "dijkstra-zigzag",
      name: "Variation 3: Zigzag Cascade",
      graph: {
        nodes: [
          n("n0", "S", 60, 300),
          n("n1", "A", 180, 140),
          n("n2", "B", 180, 460),
          n("n3", "C", 340, 220),
          n("n4", "D", 340, 420),
          n("n5", "E", 520, 140),
          n("n6", "F", 520, 460),
          n("n7", "T", 720, 300),
        ],
        edges: [
          e("e0", "n0", "n1", 1),
          e("e1", "n0", "n2", 4),
          e("e2", "n1", "n3", 2),
          e("e3", "n2", "n4", 2),
          e("e4", "n3", "n5", 3),
          e("e5", "n4", "n6", 3),
          e("e6", "n5", "n7", 2),
          e("e7", "n6", "n7", 5),
          e("e8", "n1", "n4", 6),
          e("e9", "n3", "n4", 1),
          e("e10", "n5", "n6", 4),
          e("e11", "n3", "n7", 99),
        ],
        startNodeId: "n0",
        isDirected: true,
      },
    },
  ],

  // ────────────────────────────────────────────────────────────────────────────
  // MST — Kruskal
  // Undirected dense hub-and-spoke. 8 nodes (7 ring + 1 center).
  // ────────────────────────────────────────────────────────────────────────────
  kruskal: [
    {
      id: "kruskal-hub",
      name: "Variation 1: Hub & Spoke",
      graph: {
        nodes: [
          n("n0", "0", 400, 300), // center
          n("n1", "1", 400, 80),
          n("n2", "2", 600, 160),
          n("n3", "3", 650, 360),
          n("n4", "4", 520, 520),
          n("n5", "5", 280, 520),
          n("n6", "6", 150, 360),
          n("n7", "7", 200, 160),
        ],
        edges: [
          // Spokes from center
          e("e0", "n0", "n1", 4),
          e("e1", "n0", "n2", 8),
          e("e2", "n0", "n3", 7),
          e("e3", "n0", "n4", 5),
          e("e4", "n0", "n5", 6),
          e("e5", "n0", "n6", 3),
          e("e6", "n0", "n7", 9),
          // Ring edges
          e("e7", "n1", "n2", 2),
          e("e8", "n2", "n3", 3),
          e("e9", "n3", "n4", 5),
          e("e10", "n4", "n5", 1),
          e("e11", "n5", "n6", 4),
          e("e12", "n6", "n7", 2),
          e("e13", "n7", "n1", 6),
          // Cross diagonals
          e("e14", "n1", "n5", 10),
          e("e15", "n3", "n7", 11),
        ],
        startNodeId: "n0",
        isDirected: false,
      },
    },
    {
      id: "kruskal-grid",
      name: "Variation 2: Dense Mesh",
      graph: {
        nodes: [
          n("n0", "0", 160, 150),
          n("n1", "1", 400, 150),
          n("n2", "2", 640, 150),
          n("n3", "3", 160, 350),
          n("n4", "4", 400, 350),
          n("n5", "5", 640, 350),
          n("n6", "6", 280, 520),
          n("n7", "7", 520, 520),
        ],
        edges: [
          e("e0", "n0", "n1", 3),
          e("e1", "n1", "n2", 5),
          e("e2", "n0", "n3", 6),
          e("e3", "n1", "n4", 2),
          e("e4", "n2", "n5", 4),
          e("e5", "n3", "n4", 1),
          e("e6", "n4", "n5", 7),
          e("e7", "n3", "n6", 3),
          e("e8", "n4", "n6", 8),
          e("e9", "n4", "n7", 4),
          e("e10", "n5", "n7", 2),
          e("e11", "n6", "n7", 5),
          e("e12", "n0", "n4", 9),
          e("e13", "n1", "n3", 7),
        ],
        startNodeId: "n0",
        isDirected: false,
      },
    },
    {
      id: "kruskal-ring",
      name: "Variation 3: Double Ring",
      graph: {
        nodes: [
          n("n0", "0", 400, 80),
          n("n1", "1", 600, 200),
          n("n2", "2", 620, 420),
          n("n3", "3", 400, 530),
          n("n4", "4", 180, 420),
          n("n5", "5", 200, 200),
          n("n6", "6", 320, 260),
          n("n7", "7", 480, 380),
        ],
        edges: [
          // Outer ring
          e("e0", "n0", "n1", 3),
          e("e1", "n1", "n2", 4),
          e("e2", "n2", "n3", 2),
          e("e3", "n3", "n4", 6),
          e("e4", "n4", "n5", 5),
          e("e5", "n5", "n0", 7),
          // Inner ring
          e("e6", "n6", "n7", 1),
          // Inner-Outer connections
          e("e7", "n0", "n6", 4),
          e("e8", "n1", "n7", 3),
          e("e9", "n5", "n6", 2),
          e("e10", "n3", "n7", 5),
          e("e11", "n2", "n7", 8),
          e("e12", "n4", "n6", 6),
        ],
        startNodeId: "n0",
        isDirected: false,
      },
    },
  ],

  // ────────────────────────────────────────────────────────────────────────────
  // MST — Prim (shared topology with kruskal, different weight focus)
  // ────────────────────────────────────────────────────────────────────────────
  prim: [
    {
      id: "prim-star",
      name: "Variation 1: Star Cluster",
      graph: {
        nodes: [
          n("n0", "0", 400, 300),
          n("n1", "1", 400, 80),
          n("n2", "2", 600, 180),
          n("n3", "3", 620, 400),
          n("n4", "4", 440, 540),
          n("n5", "5", 240, 540),
          n("n6", "6", 170, 400),
          n("n7", "7", 190, 180),
        ],
        edges: [
          e("e0", "n0", "n1", 2),
          e("e1", "n0", "n2", 5),
          e("e2", "n0", "n3", 3),
          e("e3", "n0", "n5", 7),
          e("e4", "n0", "n6", 4),
          e("e5", "n0", "n7", 6),
          e("e6", "n1", "n2", 3),
          e("e7", "n2", "n3", 1),
          e("e8", "n3", "n4", 4),
          e("e9", "n4", "n5", 2),
          e("e10", "n5", "n6", 5),
          e("e11", "n6", "n7", 1),
          e("e12", "n7", "n1", 3),
          e("e13", "n1", "n6", 9),
          e("e14", "n4", "n0", 8),
        ],
        startNodeId: "n0",
        isDirected: false,
      },
    },
    {
      id: "prim-lattice",
      name: "Variation 2: Lattice",
      graph: {
        nodes: [
          n("n0", "0", 160, 180),
          n("n1", "1", 400, 120),
          n("n2", "2", 640, 180),
          n("n3", "3", 160, 420),
          n("n4", "4", 400, 480),
          n("n5", "5", 640, 420),
          n("n6", "6", 400, 300),
        ],
        edges: [
          e("e0", "n0", "n1", 4),
          e("e1", "n1", "n2", 3),
          e("e2", "n0", "n3", 2),
          e("e3", "n2", "n5", 5),
          e("e4", "n3", "n4", 6),
          e("e5", "n4", "n5", 1),
          e("e6", "n0", "n6", 7),
          e("e7", "n1", "n6", 2),
          e("e8", "n2", "n6", 4),
          e("e9", "n3", "n6", 3),
          e("e10", "n4", "n6", 5),
          e("e11", "n5", "n6", 8),
        ],
        startNodeId: "n0",
        isDirected: false,
      },
    },
    {
      id: "prim-complex",
      name: "Variation 3: Dense Web",
      graph: {
        nodes: [
          n("n0", "0", 120, 300),
          n("n1", "1", 280, 120),
          n("n2", "2", 520, 120),
          n("n3", "3", 680, 300),
          n("n4", "4", 520, 480),
          n("n5", "5", 280, 480),
          n("n6", "6", 340, 300),
          n("n7", "7", 460, 300),
        ],
        edges: [
          e("e0", "n0", "n1", 3),
          e("e1", "n1", "n2", 2),
          e("e2", "n2", "n3", 4),
          e("e3", "n3", "n4", 5),
          e("e4", "n4", "n5", 1),
          e("e5", "n5", "n0", 6),
          e("e6", "n0", "n6", 2),
          e("e7", "n6", "n7", 1),
          e("e8", "n7", "n3", 3),
          e("e9", "n1", "n6", 4),
          e("e10", "n2", "n7", 5),
          e("e11", "n5", "n6", 7),
          e("e12", "n4", "n7", 3),
          e("e13", "n6", "n4", 8),
          e("e14", "n1", "n5", 9),
        ],
        startNodeId: "n0",
        isDirected: false,
      },
    },
  ],

  // ────────────────────────────────────────────────────────────────────────────
  // SEARCH — BFS
  // Directed top-down tree/grid. 7 nodes.
  // ────────────────────────────────────────────────────────────────────────────
  bfs: [
    {
      id: "bfs-binary-tree",
      name: "Variation 1: Binary Tree",
      graph: {
        nodes: [
          n("n0", "0", 400, 80),
          n("n1", "1", 220, 220),
          n("n2", "2", 580, 220),
          n("n3", "3", 130, 380),
          n("n4", "4", 310, 380),
          n("n5", "5", 490, 380),
          n("n6", "6", 670, 380),
        ],
        edges: [
          e("e0", "n0", "n1", 1),
          e("e1", "n0", "n2", 1),
          e("e2", "n1", "n3", 1),
          e("e3", "n1", "n4", 1),
          e("e4", "n2", "n5", 1),
          e("e5", "n2", "n6", 1),
        ],
        startNodeId: "n0",
        isDirected: false,
      },
    },
    {
      id: "bfs-wide-dag",
      name: "Variation 2: Wide DAG",
      graph: {
        nodes: [
          n("n0", "0", 400, 80),
          n("n1", "1", 180, 230),
          n("n2", "2", 400, 230),
          n("n3", "3", 620, 230),
          n("n4", "4", 220, 420),
          n("n5", "5", 400, 420),
          n("n6", "6", 580, 420),
        ],
        edges: [
          e("e0", "n0", "n1", 1),
          e("e1", "n0", "n2", 1),
          e("e2", "n0", "n3", 1),
          e("e3", "n1", "n4", 1),
          e("e4", "n1", "n5", 1),
          e("e5", "n2", "n5", 1),
          e("e6", "n2", "n6", 1),
          e("e7", "n3", "n6", 1),
        ],
        startNodeId: "n0",
        isDirected: false,
      },
    },
    {
      id: "bfs-grid-like",
      name: "Variation 3: Grid Cascade",
      graph: {
        nodes: [
          n("n0", "0", 200, 100),
          n("n1", "1", 400, 100),
          n("n2", "2", 600, 100),
          n("n3", "3", 200, 320),
          n("n4", "4", 400, 320),
          n("n5", "5", 600, 320),
          n("n6", "6", 400, 520),
        ],
        edges: [
          e("e0", "n0", "n1", 1),
          e("e1", "n1", "n2", 1),
          e("e2", "n0", "n3", 1),
          e("e3", "n1", "n4", 1),
          e("e4", "n2", "n5", 1),
          e("e5", "n3", "n4", 1),
          e("e6", "n4", "n5", 1),
          e("e7", "n3", "n6", 1),
          e("e8", "n4", "n6", 1),
          e("e9", "n5", "n6", 1),
        ],
        startNodeId: "n0",
        isDirected: false,
      },
    },
  ],

  // ────────────────────────────────────────────────────────────────────────────
  // SEARCH — DFS (directed top-down, deeper branches)
  // ────────────────────────────────────────────────────────────────────────────
  dfs: [
    {
      id: "dfs-deep-chain",
      name: "Variation 1: Deep Chain",
      graph: {
        nodes: [
          n("n0", "0", 200, 80),
          n("n1", "1", 200, 220),
          n("n2", "2", 200, 380),
          n("n3", "3", 200, 520),
          n("n4", "4", 450, 150),
          n("n5", "5", 450, 300),
          n("n6", "6", 600, 400),
        ],
        edges: [
          e("e0", "n0", "n1", 1),
          e("e1", "n1", "n2", 1),
          e("e2", "n2", "n3", 1),
          e("e3", "n0", "n4", 1),
          e("e4", "n4", "n5", 1),
          e("e5", "n5", "n6", 1),
          e("e6", "n2", "n5", 1),
        ],
        startNodeId: "n0",
        isDirected: true,
      },
    },
    {
      id: "dfs-branches",
      name: "Variation 2: Branching Forest",
      graph: {
        nodes: [
          n("n0", "0", 400, 80),
          n("n1", "1", 200, 220),
          n("n2", "2", 600, 220),
          n("n3", "3", 120, 400),
          n("n4", "4", 300, 400),
          n("n5", "5", 500, 400),
          n("n6", "6", 680, 400),
        ],
        edges: [
          e("e0", "n0", "n1", 1),
          e("e1", "n0", "n2", 1),
          e("e2", "n1", "n3", 1),
          e("e3", "n1", "n4", 1),
          e("e4", "n2", "n5", 1),
          e("e5", "n2", "n6", 1),
          e("e6", "n4", "n5", 1),
        ],
        startNodeId: "n0",
        isDirected: true,
      },
    },
    {
      id: "dfs-cycle",
      name: "Variation 3: Cyclic Graph",
      graph: {
        nodes: [
          n("n0", "0", 160, 160),
          n("n1", "1", 400, 80),
          n("n2", "2", 640, 160),
          n("n3", "3", 160, 420),
          n("n4", "4", 400, 500),
          n("n5", "5", 640, 420),
          n("n6", "6", 400, 290),
        ],
        edges: [
          e("e0", "n0", "n1", 1),
          e("e1", "n1", "n2", 1),
          e("e2", "n2", "n5", 1),
          e("e3", "n5", "n4", 1),
          e("e4", "n4", "n3", 1),
          e("e5", "n3", "n0", 1),
          e("e6", "n0", "n6", 1),
          e("e7", "n6", "n2", 1),
          e("e8", "n6", "n4", 1),
        ],
        startNodeId: "n0",
        isDirected: true,
      },
    },
  ],

  // ────────────────────────────────────────────────────────────────────────────
  // TOPOLOGICAL SORT (directed, DAG — no cycles)
  // ────────────────────────────────────────────────────────────────────────────
  "topo-sort": [
    {
      id: "topo-linear",
      name: "Variation 1: Linear DAG",
      graph: {
        nodes: [
          n("n0", "0", 120, 100),
          n("n1", "1", 350, 100),
          n("n2", "2", 120, 350),
          n("n3", "3", 350, 350),
          n("n4", "4", 580, 220),
          n("n5", "5", 680, 450),
          n("n6", "6", 500, 500),
        ],
        edges: [
          e("e0", "n0", "n1", 1),
          e("e1", "n0", "n2", 1),
          e("e2", "n1", "n4", 1),
          e("e3", "n2", "n3", 1),
          e("e4", "n3", "n4", 1),
          e("e5", "n4", "n5", 1),
          e("e6", "n3", "n6", 1),
          e("e7", "n6", "n5", 1),
        ],
        startNodeId: "n0",
        isDirected: true,
      },
    },
    {
      id: "topo-diamond",
      name: "Variation 2: Diamond Dependencies",
      graph: {
        nodes: [
          n("n0", "0", 400, 70),
          n("n1", "1", 200, 210),
          n("n2", "2", 600, 210),
          n("n3", "3", 200, 390),
          n("n4", "4", 400, 310),
          n("n5", "5", 600, 390),
          n("n6", "6", 400, 530),
        ],
        edges: [
          e("e0", "n0", "n1", 1),
          e("e1", "n0", "n2", 1),
          e("e2", "n1", "n3", 1),
          e("e3", "n1", "n4", 1),
          e("e4", "n2", "n4", 1),
          e("e5", "n2", "n5", 1),
          e("e6", "n3", "n6", 1),
          e("e7", "n4", "n6", 1),
          e("e8", "n5", "n6", 1),
        ],
        startNodeId: "n0",
        isDirected: true,
      },
    },
    {
      id: "topo-wide",
      name: "Variation 3: Wide Multi-Source",
      graph: {
        nodes: [
          n("n0", "0", 140, 100),
          n("n1", "1", 400, 100),
          n("n2", "2", 660, 100),
          n("n3", "3", 260, 300),
          n("n4", "4", 540, 300),
          n("n5", "5", 300, 500),
          n("n6", "6", 500, 500),
        ],
        edges: [
          e("e0", "n0", "n3", 1),
          e("e1", "n1", "n3", 1),
          e("e2", "n1", "n4", 1),
          e("e3", "n2", "n4", 1),
          e("e4", "n3", "n5", 1),
          e("e5", "n3", "n6", 1),
          e("e6", "n4", "n6", 1),
        ],
        startNodeId: "n0",
        isDirected: true,
      },
    },
  ],
};
