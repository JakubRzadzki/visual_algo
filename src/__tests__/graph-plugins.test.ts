import { describe, it, expect, beforeAll } from "vitest";
import { BFSPlugin } from "../core/plugins/graph/BFSPlugin";
import { DFSPlugin } from "../core/plugins/graph/DFSPlugin";
import { PrimPlugin } from "../core/plugins/graph/PrimPlugin";
import { TopoSortPlugin } from "../core/plugins/graph/TopoSortPlugin";
import type { GraphInput } from "../types";

// Mock crypto and performance for deterministic snapshots
const mockId = "00000000-0000-0000-0000-000000000000";
beforeAll(() => {
  if (typeof crypto === "undefined") {
    global.crypto = { randomUUID: () => mockId } as unknown as Crypto;
  } else {
    crypto.randomUUID = () => mockId;
  }
  if (typeof performance === "undefined") {
    global.performance = { now: () => 0 } as unknown as Performance;
  } else {
    performance.now = () => 0;
  }
});

// ─── Shared test graph fixtures ───────────────────────────────────────────────

/** Simple undirected triangle: A—B—C—A */
const triangleGraph: GraphInput = {
  nodes: [
    { id: "A", label: "A", x: 0, y: 0, vx: 0, vy: 0 },
    { id: "B", label: "B", x: 100, y: 0, vx: 0, vy: 0 },
    { id: "C", label: "C", x: 50, y: 100, vx: 0, vy: 0 },
  ],
  edges: [
    { id: "e1", from: "A", to: "B", weight: 1 },
    { id: "e2", from: "B", to: "C", weight: 2 },
    { id: "e3", from: "A", to: "C", weight: 3 },
  ],
  isDirected: false,
};

/** Weighted graph for MST testing */
const weightedGraph: GraphInput = {
  nodes: [
    { id: "A", label: "A", x: 0, y: 0, vx: 0, vy: 0 },
    { id: "B", label: "B", x: 100, y: 0, vx: 0, vy: 0 },
    { id: "C", label: "C", x: 200, y: 0, vx: 0, vy: 0 },
    { id: "D", label: "D", x: 100, y: 100, vx: 0, vy: 0 },
  ],
  edges: [
    { id: "e1", from: "A", to: "B", weight: 1 },
    { id: "e2", from: "B", to: "C", weight: 4 },
    { id: "e3", from: "A", to: "D", weight: 3 },
    { id: "e4", from: "B", to: "D", weight: 2 },
    { id: "e5", from: "C", to: "D", weight: 5 },
  ],
  isDirected: false,
};

/** Directed Acyclic Graph for TopoSort */
const dagGraph: GraphInput = {
  nodes: [
    { id: "A", label: "A", x: 0, y: 0, vx: 0, vy: 0 },
    { id: "B", label: "B", x: 100, y: 0, vx: 0, vy: 0 },
    { id: "C", label: "C", x: 200, y: 0, vx: 0, vy: 0 },
    { id: "D", label: "D", x: 100, y: 100, vx: 0, vy: 0 },
  ],
  edges: [
    { id: "e1", from: "A", to: "B", weight: 1 },
    { id: "e2", from: "A", to: "C", weight: 1 },
    { id: "e3", from: "B", to: "D", weight: 1 },
    { id: "e4", from: "C", to: "D", weight: 1 },
  ],
  isDirected: true,
};

// ─── Step 11: Graph Plugin Tests ──────────────────────────────────────────────

describe("BFSPlugin", () => {
  const plugin = new BFSPlugin();

  it("should have correct metadata", () => {
    expect(plugin.id).toBe("bfs");
    expect(plugin.name).toBe("Breadth-First Search");
    expect(plugin.category).toBe("graph");
  });

  it("should visit all nodes in the triangle graph", () => {
    const trace = plugin.execute({ ...triangleGraph, startNodeId: "A" });
    const nodeHighlights = trace.events.filter(
      (e) => e.type === "GRAPH_NODE_HIGHLIGHT",
    );
    const visitedNodes = new Set(
      nodeHighlights.map((e) =>
        e.type === "GRAPH_NODE_HIGHLIGHT" ? e.nodeId : "",
      ),
    );
    expect(visitedNodes.size).toBe(3);
    expect(visitedNodes.has("A")).toBe(true);
    expect(visitedNodes.has("B")).toBe(true);
    expect(visitedNodes.has("C")).toBe(true);
  });

  it("should emit GRAPH_EDGE_HIGHLIGHT events", () => {
    const trace = plugin.execute({ ...triangleGraph, startNodeId: "A" });
    const edgeEvents = trace.events.filter(
      (e) => e.type === "GRAPH_EDGE_HIGHLIGHT",
    );
    expect(edgeEvents.length).toBeGreaterThan(0);
  });

  it("should start from the specified startNodeId", () => {
    const trace = plugin.execute({ ...triangleGraph, startNodeId: "C" });
    const nodeHighlights = trace.events.filter(
      (e) => e.type === "GRAPH_NODE_HIGHLIGHT",
    );
    // First highlighted node should be the start node
    expect(
      nodeHighlights[0].type === "GRAPH_NODE_HIGHLIGHT" &&
        nodeHighlights[0].nodeId,
    ).toBe("C");
  });

  it("should handle empty graph gracefully", () => {
    const trace = plugin.execute({ nodes: [], edges: [] });
    const errorLogs = trace.events.filter(
      (e) => e.type === "SYSTEM_LOG" && e.level === "ERROR",
    );
    expect(errorLogs.length).toBe(1);
  });

  it("should set correct complexity metadata", () => {
    const trace = plugin.execute(triangleGraph);
    expect(trace.metadata.timeComplexity).toBe("O(V + E)");
    expect(trace.metadata.spaceComplexity).toBe("O(V)");
  });
});

describe("DFSPlugin", () => {
  const plugin = new DFSPlugin();

  it("should have correct metadata", () => {
    expect(plugin.id).toBe("dfs");
    expect(plugin.name).toBe("Depth-First Search");
    expect(plugin.category).toBe("graph");
  });

  it("should visit all nodes in the triangle graph", () => {
    const trace = plugin.execute({ ...triangleGraph, startNodeId: "A" });
    const nodeHighlights = trace.events.filter(
      (e) => e.type === "GRAPH_NODE_HIGHLIGHT",
    );
    const visitedNodes = new Set(
      nodeHighlights.map((e) =>
        e.type === "GRAPH_NODE_HIGHLIGHT" ? e.nodeId : "",
      ),
    );
    expect(visitedNodes.size).toBe(3);
  });

  it("should emit GRAPH_EDGE_HIGHLIGHT events", () => {
    const trace = plugin.execute({ ...triangleGraph, startNodeId: "A" });
    const edgeEvents = trace.events.filter(
      (e) => e.type === "GRAPH_EDGE_HIGHLIGHT",
    );
    expect(edgeEvents.length).toBeGreaterThan(0);
  });

  it("should not visit any node twice", () => {
    const trace = plugin.execute(weightedGraph);
    const nodeHighlights = trace.events
      .filter((e) => e.type === "GRAPH_NODE_HIGHLIGHT")
      .map((e) => (e.type === "GRAPH_NODE_HIGHLIGHT" ? e.nodeId : ""));
    const uniqueNodes = new Set(nodeHighlights);
    expect(uniqueNodes.size).toBe(nodeHighlights.length);
  });

  it("should handle empty graph gracefully", () => {
    const trace = plugin.execute({ nodes: [], edges: [] });
    const errorLogs = trace.events.filter(
      (e) => e.type === "SYSTEM_LOG" && e.level === "ERROR",
    );
    expect(errorLogs.length).toBe(1);
  });
});

describe("PrimPlugin", () => {
  const plugin = new PrimPlugin();

  it("should have correct metadata", () => {
    expect(plugin.id).toBe("prim");
    expect(plugin.name).toBe("Prim's MST");
    expect(plugin.category).toBe("graph");
  });

  it("should build an MST with V-1 accepted edges", () => {
    const trace = plugin.execute(weightedGraph);
    const acceptedEdges = trace.events.filter(
      (e) => e.type === "GRAPH_EDGE_HIGHLIGHT" && e.accepted === true,
    );
    // MST of 4 nodes should have exactly 3 edges
    expect(acceptedEdges.length).toBe(weightedGraph.nodes.length - 1);
  });

  it("should visit all nodes", () => {
    const trace = plugin.execute(weightedGraph);
    const nodeHighlights = trace.events.filter(
      (e) => e.type === "GRAPH_NODE_HIGHLIGHT",
    );
    const visitedNodes = new Set(
      nodeHighlights.map((e) =>
        e.type === "GRAPH_NODE_HIGHLIGHT" ? e.nodeId : "",
      ),
    );
    expect(visitedNodes.size).toBe(weightedGraph.nodes.length);
  });

  it("should emit a completion SYSTEM_LOG", () => {
    const trace = plugin.execute(weightedGraph);
    const logs = trace.events.filter(
      (e) => e.type === "SYSTEM_LOG" && e.level === "INFO",
    );
    expect(logs.length).toBeGreaterThan(0);
  });

  it("should handle empty graph gracefully", () => {
    const trace = plugin.execute({ nodes: [], edges: [] });
    const errorLogs = trace.events.filter(
      (e) => e.type === "SYSTEM_LOG" && e.level === "ERROR",
    );
    expect(errorLogs.length).toBe(1);
  });

  it("should reject edges that would create a cycle", () => {
    const trace = plugin.execute(weightedGraph);
    const rejectedEdges = trace.events.filter(
      (e) => e.type === "GRAPH_EDGE_HIGHLIGHT" && e.accepted === false,
    );
    // weightedGraph has 5 edges and 4 nodes, MST needs 3 — at least some must be rejected
    expect(rejectedEdges.length).toBeGreaterThanOrEqual(1);
  });
});

describe("TopoSortPlugin", () => {
  const plugin = new TopoSortPlugin();

  it("should have correct metadata", () => {
    expect(plugin.id).toBe("topo-sort");
    expect(plugin.name).toBe("Topological Sort");
    expect(plugin.category).toBe("graph");
  });

  it("should order all nodes in the DAG", () => {
    const trace = plugin.execute(dagGraph);
    const nodeHighlights = trace.events.filter(
      (e) => e.type === "GRAPH_NODE_HIGHLIGHT",
    );
    expect(nodeHighlights.length).toBe(dagGraph.nodes.length);
  });

  it("should place A before B and C (since A → B and A → C)", () => {
    const trace = plugin.execute(dagGraph);
    const order = trace.events
      .filter((e) => e.type === "GRAPH_NODE_HIGHLIGHT")
      .map((e) => (e.type === "GRAPH_NODE_HIGHLIGHT" ? e.nodeId : ""));

    const indexA = order.indexOf("A");
    const indexB = order.indexOf("B");
    const indexC = order.indexOf("C");
    expect(indexA).toBeLessThan(indexB);
    expect(indexA).toBeLessThan(indexC);
  });

  it("should place D last (since B → D and C → D)", () => {
    const trace = plugin.execute(dagGraph);
    const order = trace.events
      .filter((e) => e.type === "GRAPH_NODE_HIGHLIGHT")
      .map((e) => (e.type === "GRAPH_NODE_HIGHLIGHT" ? e.nodeId : ""));

    const indexD = order.indexOf("D");
    expect(indexD).toBe(order.length - 1);
  });

  it("should emit GRAPH_EDGE_HIGHLIGHT for all DAG edges", () => {
    const trace = plugin.execute(dagGraph);
    const edgeEvents = trace.events.filter(
      (e) => e.type === "GRAPH_EDGE_HIGHLIGHT",
    );
    expect(edgeEvents.length).toBe(dagGraph.edges.length);
  });

  it("should detect a cycle in a cyclic graph", () => {
    const cyclicGraph: GraphInput = {
      nodes: [
        { id: "A", label: "A", x: 0, y: 0, vx: 0, vy: 0 },
        { id: "B", label: "B", x: 100, y: 0, vx: 0, vy: 0 },
        { id: "C", label: "C", x: 50, y: 100, vx: 0, vy: 0 },
      ],
      edges: [
        { id: "e1", from: "A", to: "B", weight: 1 },
        { id: "e2", from: "B", to: "C", weight: 1 },
        { id: "e3", from: "C", to: "A", weight: 1 }, // creates cycle
      ],
      isDirected: true,
    };

    const trace = plugin.execute(cyclicGraph);
    const warnLogs = trace.events.filter(
      (e) => e.type === "SYSTEM_LOG" && e.level === "WARN",
    );
    expect(warnLogs.length).toBe(1);
  });

  it("should handle empty graph gracefully", () => {
    const trace = plugin.execute({ nodes: [], edges: [] });
    const errorLogs = trace.events.filter(
      (e) => e.type === "SYSTEM_LOG" && e.level === "ERROR",
    );
    expect(errorLogs.length).toBe(1);
  });
});
