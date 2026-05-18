/**
 * @file PrimPlugin.ts
 * @description Plugin for Prim's Minimum Spanning Tree (MST) algorithm.
 *
 * Grows the MST from a starting node by greedily adding the cheapest edge.
 * Time Complexity: O((V + E) log V)
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
 * PrimPlugin — Implements Prim's MST algorithm.
 */
export class PrimPlugin implements AlgorithmPlugin<GraphInput> {
  id = "prim";
  name = "Prim's MST";
  category = "graph" as const;

  /**
   * Executes Prim's algorithm to find the MST.
   *
   * @param data - The graph input data including nodes, edges, and optional startNodeId.
   * @returns An ExecutionTrace with greedy edge selection events.
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

    if (nodes.length === 0) {
      push({
        type: "SYSTEM_LOG",
        level: "ERROR",
        message: "No nodes provided to Prim.",
      });
      return {
        events,
        metadata: {
          timeComplexity: "O((V + E) log V)",
          spaceComplexity: "O(V)",
          executionTimeMs: 0,
          nodeCount: 0,
          algorithmName: this.name,
        },
      };
    }

    // Phase: Building adjacency list (undirected)
    const adj: Record<
      string,
      { to: string; weight: number; edgeId: string }[]
    > = {};
    for (const n of nodes) adj[n.id] = [];
    for (const e of edges) {
      adj[e.from]?.push({ to: e.to, weight: e.weight, edgeId: e.id });
      adj[e.to]?.push({ to: e.from, weight: e.weight, edgeId: e.id });
    }

    const source = startNodeId ?? nodes[0].id;
    const inMST = new Set<string>();
    let mstWeight = 0;
    let edgesAdded = 0;

    // Phase: Initializing greedy exploration from source
    type PQEntry = { weight: number; nodeId: string; edgeId: string };
    const pq: PQEntry[] = []; // In production, use a Binary Heap

    inMST.add(source);
    push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: source });

    // Add all edges from source to candidate set
    for (const neighbor of adj[source] ?? []) {
      pq.push({
        weight: neighbor.weight,
        nodeId: neighbor.to,
        edgeId: neighbor.edgeId,
      });
    }

    // Phase: Greedily expanding the tree
    while (pq.length > 0 && edgesAdded < nodes.length - 1) {
      // Greedy Choice: find edge with minimum weight
      pq.sort((a, b) => a.weight - b.weight);
      const { weight, nodeId, edgeId } = pq.shift()!;

      if (inMST.has(nodeId)) {
        // Edge leads back to MST, reject to avoid cycles
        push({ type: "GRAPH_EDGE_HIGHLIGHT", edgeId, accepted: false });
        continue;
      }

      // Accept edge and add new node to MST
      inMST.add(nodeId);
      mstWeight += weight;
      edgesAdded++;
      push({ type: "GRAPH_EDGE_HIGHLIGHT", edgeId, accepted: true });
      push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId });

      // Update candidate edges from newly added node
      for (const neighbor of adj[nodeId] ?? []) {
        if (!inMST.has(neighbor.to)) {
          pq.push({
            weight: neighbor.weight,
            nodeId: neighbor.to,
            edgeId: neighbor.edgeId,
          });
        }
      }
    }

    const endTime = performance.now();

    push({
      type: "SYSTEM_LOG",
      level: "INFO",
      message: `Prim's MST complete. Total weight: ${mstWeight}. Edges in tree: ${edgesAdded}.`,
    });

    return {
      events,
      metadata: {
        timeComplexity: "O((V + E) log V)",
        spaceComplexity: "O(V)",
        executionTimeMs: endTime - startTime,
        nodeCount: nodes.length,
        algorithmName: this.name,
      },
    };
  }
}
