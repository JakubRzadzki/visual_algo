import { describe, it, expect } from "vitest";
import { DijkstraPlugin } from "../core/plugins/graph/DijkstraPlugin";
import { KruskalPlugin } from "../core/plugins/graph/KruskalPlugin";

// We mock crypto and performance for deterministic snapshots
const mockId = "00000000-0000-0000-0000-000000000000";
if (typeof crypto === "undefined") {
  global.crypto = {
    randomUUID: () => mockId,
  } as unknown as Crypto;
} else {
  crypto.randomUUID = () => mockId;
}

if (typeof performance === "undefined") {
  global.performance = {
    now: () => 0,
  } as unknown as Performance;
} else {
  performance.now = () => 0;
}

const mockGraph = {
  nodes: [
    { id: "A", label: "A", x: 0, y: 0, vx: 0, vy: 0 },
    { id: "B", label: "B", x: 0, y: 0, vx: 0, vy: 0 },
  ],
  edges: [{ id: "e1", from: "A", to: "B", weight: 5 }],
};

describe("Graph Plugins", () => {
  it("Dijkstra executes without errors", () => {
    const plugin = new DijkstraPlugin();
    const trace = plugin.execute({ ...mockGraph, startNodeId: "A" });
    expect(trace.events.length).toBeGreaterThan(0);
    expect(trace).toMatchSnapshot();
  });

  it("Kruskal executes without errors", () => {
    const plugin = new KruskalPlugin();
    const trace = plugin.execute(mockGraph);
    expect(trace.events.length).toBeGreaterThan(0);
    expect(trace).toMatchSnapshot();
  });
});
