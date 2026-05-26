/**
 * @file BinaryTreePlugin.ts
 * @description Web Worker plugin implementing Binary Tree Traversals (Pre-order, In-order, Post-order).
 *
 * Implements AlgorithmPlugin<any> and emits node highlighting, edge highlights,
 * and system logs for each traversal phase, enabling step-by-step educational visualization.
 *
 * Time Complexity:  O(n) for traversals where n is the number of nodes
 * Space Complexity: O(h) call stack depth where h is the tree height
 */

import type {
  AlgorithmPlugin,
  ExecutionTrace,
  VisualizationEvent,
  EventPayload,
  GraphInput,
} from "../../../types";

/**
 * BinaryTreePlugin simulates Depth-First traversals on an expression binary tree.
 */
export class BinaryTreePlugin implements AlgorithmPlugin<any> {
  id = "binary";
  name = "Binary Tree";
  category = "tree" as const;

  /**
   * Executes the traversals on the pre-built expression tree.
   *
   * @param _data - Unused input parameter (uses fixed tree structure for traversal illustration).
   * @returns An ExecutionTrace containing the ordered visualization events.
   */
  execute(_data: any): ExecutionTrace {
    const events: VisualizationEvent[] = [];
    let step = 0;
    const startTime = performance.now();

    const push = (evt: EventPayload) => {
      events.push({
        ...evt,
        id: crypto.randomUUID(),
        timestamp: performance.now(),
        step: step++,
      });
    };

    // Expression tree definition: + (A, * (B, C))
    const nodes = [
      { id: "node-root", label: "+" },
      { id: "node-A", label: "A" },
      { id: "node-mul", label: "*" },
      { id: "node-B", label: "B" },
      { id: "node-C", label: "C" },
    ];

    const edges = [
      { id: "e-root-A", from: "node-root", to: "node-A" },
      { id: "e-root-mul", from: "node-root", to: "node-mul" },
      { id: "e-mul-B", from: "node-mul", to: "node-B" },
      { id: "e-mul-C", from: "node-mul", to: "node-C" },
    ];

    push({
      type: "SYSTEM_LOG",
      level: "INFO",
      message: "Starting Binary Tree Traversals demonstration.",
    });

    // Make all nodes and edges visible at start
    nodes.forEach((n) => push({ type: "GRAPH_NODE_ADD", nodeId: n.id }));
    edges.forEach((e) => push({ type: "GRAPH_EDGE_ADD", edgeId: e.id, from: e.from, to: e.to }));

    // Helper to reset highlight styles before next traversal
    const pushResetStyle = (msg: string) => {
      push({ type: "SYSTEM_LOG", level: "INFO", message: msg });
      nodes.forEach((n) => push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: n.id, status: "visited" }));
    };

    // ─── 1. Pre-order Traversal (Root, Left, Right) ───────────────────────────
    pushResetStyle("--- Starting Pre-order Traversal (Root -> Left -> Right) ---");

    const preOrder = (nodeId: string) => {
      push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId, status: "current" });
      const nodeLabel = nodes.find((n) => n.id === nodeId)?.label || "";
      push({ type: "SYSTEM_LOG", level: "INFO", message: `Pre-order: Visiting Node (${nodeLabel})` });
      push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId, status: "start" }); // "start" status is styled green

      if (nodeId === "node-root") {
        push({ type: "GRAPH_EDGE_HIGHLIGHT", edgeId: "e-root-A", accepted: true });
        preOrder("node-A");
        push({ type: "GRAPH_EDGE_HIGHLIGHT", edgeId: "e-root-mul", accepted: true });
        preOrder("node-mul");
      } else if (nodeId === "node-mul") {
        push({ type: "GRAPH_EDGE_HIGHLIGHT", edgeId: "e-mul-B", accepted: true });
        preOrder("node-B");
        push({ type: "GRAPH_EDGE_HIGHLIGHT", edgeId: "e-mul-C", accepted: true });
        preOrder("node-C");
      }
    };
    preOrder("node-root");

    // ─── 2. In-order Traversal (Left, Root, Right) ────────────────────────────
    pushResetStyle("--- Starting In-order Traversal (Left -> Root -> Right) ---");

    const inOrder = (nodeId: string) => {
      if (nodeId === "node-root") {
        push({ type: "GRAPH_EDGE_HIGHLIGHT", edgeId: "e-root-A", accepted: true });
        inOrder("node-A");
      } else if (nodeId === "node-mul") {
        push({ type: "GRAPH_EDGE_HIGHLIGHT", edgeId: "e-mul-B", accepted: true });
        inOrder("node-B");
      }

      push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId, status: "current" });
      const nodeLabel = nodes.find((n) => n.id === nodeId)?.label || "";
      push({ type: "SYSTEM_LOG", level: "INFO", message: `In-order: Visiting Node (${nodeLabel})` });
      push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId, status: "start" });

      if (nodeId === "node-root") {
        push({ type: "GRAPH_EDGE_HIGHLIGHT", edgeId: "e-root-mul", accepted: true });
        inOrder("node-mul");
      } else if (nodeId === "node-mul") {
        push({ type: "GRAPH_EDGE_HIGHLIGHT", edgeId: "e-mul-C", accepted: true });
        inOrder("node-C");
      }
    };
    inOrder("node-root");

    // ─── 3. Post-order Traversal (Left, Right, Root) ──────────────────────────
    pushResetStyle("--- Starting Post-order Traversal (Left -> Right -> Root) ---");

    const postOrder = (nodeId: string) => {
      if (nodeId === "node-root") {
        push({ type: "GRAPH_EDGE_HIGHLIGHT", edgeId: "e-root-A", accepted: true });
        postOrder("node-A");
        push({ type: "GRAPH_EDGE_HIGHLIGHT", edgeId: "e-root-mul", accepted: true });
        postOrder("node-mul");
      } else if (nodeId === "node-mul") {
        push({ type: "GRAPH_EDGE_HIGHLIGHT", edgeId: "e-mul-B", accepted: true });
        postOrder("node-B");
        push({ type: "GRAPH_EDGE_HIGHLIGHT", edgeId: "e-mul-C", accepted: true });
        postOrder("node-C");
      }

      push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId, status: "current" });
      const nodeLabel = nodes.find((n) => n.id === nodeId)?.label || "";
      push({ type: "SYSTEM_LOG", level: "INFO", message: `Post-order: Visiting Node (${nodeLabel})` });
      push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId, status: "start" });
    };
    postOrder("node-root");

    push({
      type: "SYSTEM_LOG",
      level: "INFO",
      message: "All tree traversals completed successfully.",
    });

    const initialGraph: GraphInput = {
      nodes: nodes.map((n) => ({
        id: n.id,
        label: n.label,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        hidden: false,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        from: e.from,
        to: e.to,
        weight: 0,
        hidden: false,
      })),
      isDirected: true,
      layoutHint: "dagre",
    };

    return {
      events,
      metadata: {
        timeComplexity: "O(n)",
        spaceComplexity: "O(h)",
        executionTimeMs: performance.now() - startTime,
        nodeCount: nodes.length,
        algorithmName: this.name,
        initialGraph,
      },
    };
  }
}
