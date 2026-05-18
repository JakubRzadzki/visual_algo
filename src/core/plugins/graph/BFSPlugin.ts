/**
 * @file BFSPlugin.ts
 * @description Plugin for the Breadth-First Search (BFS) algorithm.
 *
 * Explores a graph level by level using a queue.
 * Time Complexity: O(V + E)
 * Space Complexity: O(V)
 */

import type {
  AlgorithmPlugin,
  ExecutionTrace,
  GraphInput,
  VisualizationEvent,
  EventPayload,
} from "../../../types";

/**
 * BFSPlugin — Implements the Breadth-First Search algorithm.
 */
export class BFSPlugin implements AlgorithmPlugin<GraphInput> {
  id = "bfs";
  name = "Breadth-First Search";
  category = "graph" as const;

  /**
   * Executes BFS starting from a given source node.
   *
   * @param data - The graph input data including nodes, edges, and optional startNodeId.
   * @returns An ExecutionTrace containing node highlighting and edge exploration events.
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
      push({
        type: "SYSTEM_LOG",
        level: "ERROR",
        message: "No nodes provided to BFS.",
      });
      return {
        events,
        metadata: {
          timeComplexity: "O(V + E)",
          spaceComplexity: "O(V)",
          executionTimeMs: 0,
          nodeCount: 0,
          algorithmName: this.name,
        },
      };
    }

    // Phase: Building adjacency list
    const adj: Record<string, { to: string; edgeId: string }[]> = {};
    for (const n of nodes) adj[n.id] = [];
    for (const e of edges) {
      adj[e.from]?.push({ to: e.to, edgeId: e.id });
      // Assuming undirected for visual demonstration if not specified
      adj[e.to]?.push({ to: e.from, edgeId: e.id });
    }

    const visited = new Set<string>();
    const queue: string[] = [source];
    visited.add(source);

    // Initial event: highlight source node
    push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: source, distance: 0 });

    // Phase: Main BFS loop using a Queue
    while (queue.length > 0) {
      const u = queue.shift()!; // O(1) in small queues, O(V) total shifts

      for (const { to: v, edgeId } of adj[u] ?? []) {
        // Record edge exploration
        push({
          type: "GRAPH_EDGE_HIGHLIGHT",
          edgeId,
          accepted: !visited.has(v),
        });

        if (!visited.has(v)) {
          visited.add(v);
          queue.push(v);
          // Record node discovery
          push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: v });
        }
      }
    }

    const endTime = performance.now();

    push({
      type: "SYSTEM_LOG",
      level: "INFO",
      message: `BFS complete from "${source}". Visited ${visited.size} of ${nodes.length} nodes.`,
    });

    return {
      events,
      metadata: {
        timeComplexity: "O(V + E)",
        spaceComplexity: "O(V)",
        executionTimeMs: endTime - startTime,
        nodeCount: nodes.length,
        algorithmName: this.name,
      },
    };
  }
}
