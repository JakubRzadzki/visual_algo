import { describe, it, expect } from 'vitest';
import { DijkstraPlugin } from '../core/plugins/graph/DijkstraPlugin';
import { KruskalPlugin } from '../core/plugins/graph/KruskalPlugin';

const mockGraph = {
  nodes: [
    { id: 'A', label: 'A', x: 0, y: 0, vx: 0, vy: 0 },
    { id: 'B', label: 'B', x: 0, y: 0, vx: 0, vy: 0 }
  ],
  edges: [
    { id: 'e1', from: 'A', to: 'B', weight: 5 }
  ]
};

describe('Graph Plugins', () => {
  it('Dijkstra executes without errors', () => {
    const plugin = new DijkstraPlugin();
    const trace = plugin.execute({ ...mockGraph, startNodeId: 'A' });
    expect(trace.events.length).toBeGreaterThan(0);
    expect(trace).toMatchSnapshot();
  });

  it('Kruskal executes without errors', () => {
    const plugin = new KruskalPlugin();
    const trace = plugin.execute(mockGraph);
    expect(trace.events.length).toBeGreaterThan(0);
    expect(trace).toMatchSnapshot();
  });
});
