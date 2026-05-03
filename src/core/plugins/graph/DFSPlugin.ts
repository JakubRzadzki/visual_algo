/**
 * @file DFSPlugin.ts
 * @description Plugin for the Depth-First Search (DFS) algorithm.
 * 
 * Explores a graph by going as deep as possible before backtracking.
 * Time Complexity: O(V + E)
 * Space Complexity: O(V)
 */

import type { AlgorithmPlugin, ExecutionTrace, GraphInput, VisualizationEvent, EventPayload } from '../../../types';

/**
 * DFSPlugin — Implements the Depth-First Search algorithm.
 */
export class DFSPlugin implements AlgorithmPlugin<GraphInput> {
  id = 'dfs';
  name = 'Depth-First Search';
  category = 'graph' as const;

  /**
   * Executes DFS starting from a given source node.
   * 
   * @param data - The graph input data including nodes, edges, and optional startNodeId.
   * @returns An ExecutionTrace containing node highlighting and stack-based exploration events.
   */
  execute(data: GraphInput): ExecutionTrace {
    const { nodes, edges, startNodeId } = data;
    const events: VisualizationEvent[] = [];
    let step = 0;
    const startTime = performance.now();

    const push = (evt: EventPayload) => {
      events.push({
        ...evt,
        id: crypto.randomUUID(),
        timestamp: performance.now(),
        step: step++,
      } as VisualizationEvent);
    };

    const source = startNodeId ?? nodes[0]?.id;
    if (!source) {
      push({ type: 'SYSTEM_LOG', level: 'ERROR', message: 'No nodes provided to DFS.' });
      return { 
        events, 
        metadata: { 
          timeComplexity: 'O(V + E)', 
          spaceComplexity: 'O(V)', 
          executionTimeMs: 0, 
          nodeCount: 0, 
          algorithmName: this.name 
        } 
      };
    }

    // Phase: Building adjacency list
    const adj: Record<string, { to: string; edgeId: string }[]> = {};
    for (const n of nodes) adj[n.id] = [];
    for (const e of edges) {
      adj[e.from]?.push({ to: e.to, edgeId: e.id });
      adj[e.to]?.push({ to: e.from, edgeId: e.id }); // Undirected
    }

    const visited = new Set<string>();
    const stack: string[] = [source];

    // Phase: Main DFS loop using an explicit Stack
    while (stack.length > 0) {
      const u = stack.pop()!;

      if (visited.has(u)) continue;
      visited.add(u);

      // Highlight the node being visited
      push({ type: 'GRAPH_NODE_HIGHLIGHT', nodeId: u });

      // Explore neighbors in reverse to maintain intuitive visual ordering
      const neighbors = (adj[u] ?? []).slice().reverse();
      for (const { to: v, edgeId } of neighbors) {
        // Record edge probe
        push({ type: 'GRAPH_EDGE_HIGHLIGHT', edgeId, accepted: !visited.has(v) });

        if (!visited.has(v)) {
          stack.push(v);
        }
      }
    }

    const endTime = performance.now();

    push({
      type: 'SYSTEM_LOG',
      level: 'INFO',
      message: `DFS complete from "${source}". Visited ${visited.size} of ${nodes.length} nodes.`,
    });

    return {
      events,
      metadata: {
        timeComplexity: 'O(V + E)',
        spaceComplexity: 'O(V)',
        executionTimeMs: endTime - startTime,
        nodeCount: nodes.length,
        algorithmName: this.name,
      },
    };
  }
}
