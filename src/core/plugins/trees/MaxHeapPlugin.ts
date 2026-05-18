import type {
  AlgorithmPlugin,
  ExecutionTrace,
  ArrayInput,
  GraphInput,
  VisualizationEvent,
  EventPayload,
} from "../../../types";

export class MaxHeapPlugin implements AlgorithmPlugin<ArrayInput> {
  id = "max-heap";
  name = "Max Heap";
  category = "tree" as const;

  execute(data: ArrayInput): ExecutionTrace {
    const values =
      data.values && data.values.length > 0
        ? data.values
        : [15, 30, 20, 45, 10, 50];
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

    const nodes: { id: string; label: string; hidden: boolean }[] = [];
    const edges: { id: string; from: string; to: string; hidden: boolean }[] =
      [];

    // 1. Build the final heap structure to generate the fixed layout
    const finalHeap: number[] = [];

    values.forEach((val) => {
      finalHeap.push(val);
      let curr = finalHeap.length - 1;
      while (curr > 0) {
        const parent = Math.floor((curr - 1) / 2);
        if (finalHeap[curr] > finalHeap[parent]) {
          const temp = finalHeap[curr];
          finalHeap[curr] = finalHeap[parent];
          finalHeap[parent] = temp;
          curr = parent;
        } else {
          break;
        }
      }
    });

    for (let i = 0; i < finalHeap.length; i++) {
      nodes.push({ id: `n${i}`, label: String(finalHeap[i]), hidden: true });
      if (i > 0) {
        const parent = Math.floor((i - 1) / 2);
        edges.push({
          id: `e${parent}-${i}`,
          from: `n${parent}`,
          to: `n${i}`,
          hidden: true,
        });
      }
    }

    // 2. Animate the insertion
    push({
      type: "SYSTEM_LOG",
      level: "INFO",
      message: "Starting Max Heap construction (insertions).",
    });

    const simHeap: { id: string; val: number }[] = [];

    values.forEach((val, index) => {
      push({
        type: "SYSTEM_LOG",
        level: "INFO",
        message: `Inserting ${val} at the end.`,
      });

      const nodeId = `n${index}`;
      simHeap.push({ id: nodeId, val });

      // Node appears at the bottom
      push({ type: "GRAPH_NODE_ADD", nodeId });
      // In the final layout, its label is finalHeap[i]. We need to temporarily set it.
      // But the layout uses 'label' from data. We can just highlight it.
      push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId, status: "current" });

      if (index > 0) {
        const parent = Math.floor((index - 1) / 2);
        push({
          type: "GRAPH_EDGE_ADD",
          edgeId: `e${parent}-${index}`,
          from: `n${parent}`,
          to: `n${index}`,
        });
      }

      // Sift up
      let curr = simHeap.length - 1;
      while (curr > 0) {
        const parent = Math.floor((curr - 1) / 2);
        push({
          type: "GRAPH_NODE_HIGHLIGHT",
          nodeId: simHeap[parent].id,
          status: "queued",
        });
        push({
          type: "SYSTEM_LOG",
          level: "INFO",
          message: `Comparing ${simHeap[curr].val} with parent ${simHeap[parent].val}`,
        });

        if (simHeap[curr].val > simHeap[parent].val) {
          push({
            type: "SYSTEM_LOG",
            level: "WARN",
            message: `Swapping ${simHeap[curr].val} and ${simHeap[parent].val}`,
          });

          const temp = simHeap[curr];
          simHeap[curr] = simHeap[parent];
          simHeap[parent] = temp;

          curr = parent;
          push({
            type: "GRAPH_NODE_HIGHLIGHT",
            nodeId: simHeap[curr].id,
            status: "current",
          });
        } else {
          break;
        }
      }

      push({
        type: "GRAPH_NODE_HIGHLIGHT",
        nodeId: simHeap[curr].id,
        status: "visited",
      });
    });

    const initialGraph: GraphInput = {
      nodes: nodes.map((n) => ({
        id: n.id,
        label: n.label,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        hidden: true,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        from: e.from,
        to: e.to,
        weight: 0,
        hidden: true,
      })),
      isDirected: true,
      layoutHint: "dagre",
    };

    const endTime = performance.now();

    return {
      events,
      metadata: {
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(n)",
        executionTimeMs: endTime - startTime,
        nodeCount: nodes.length,
        algorithmName: this.name,
        initialGraph,
      },
    };
  }
}
