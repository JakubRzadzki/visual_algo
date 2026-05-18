import type {
  AlgorithmPlugin,
  ExecutionTrace,
  ArrayInput,
  GraphInput,
  VisualizationEvent,
  EventPayload,
} from "../../../types";

export class UnionFindPlugin implements AlgorithmPlugin<ArrayInput> {
  id = "union-find";
  name = "Union-Find (Disjoint Set)";
  category = "tree" as const;

  execute(data: ArrayInput): ExecutionTrace {
    // ArrayInput serves as a list of "Unions" to perform. E.g. [0,1, 1,2, 3,4] means union(0,1), union(1,2), union(3,4).
    const values =
      data.values && data.values.length > 0 && data.values.length % 2 === 0
        ? data.values
        : [0, 1, 1, 2, 3, 4, 4, 5, 2, 5];

    // We need an upper bound for nodes based on the values
    const maxVal = Math.max(...values, 5);
    const n = maxVal + 1;

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

    // Initialize all nodes
    for (let i = 0; i < n; i++) {
      nodes.push({ id: `n${i}`, label: String(i), hidden: true });
    }

    const parent = Array.from({ length: n }, (_, i) => i);
    const rank = Array(n).fill(0);

    // Track visual edges to form the final structure
    const visualEdges: { from: number; to: number }[] = [];

    const find = (i: number): number => {
      if (parent[i] !== i) {
        // Path compression
        parent[i] = find(parent[i]);
      }
      return parent[i];
    };

    const union = (i: number, j: number) => {
      const rootI = find(i);
      const rootJ = find(j);
      if (rootI !== rootJ) {
        if (rank[rootI] < rank[rootJ]) {
          parent[rootI] = rootJ;
          visualEdges.push({ from: rootI, to: rootJ });
        } else if (rank[rootI] > rank[rootJ]) {
          parent[rootJ] = rootI;
          visualEdges.push({ from: rootJ, to: rootI });
        } else {
          parent[rootJ] = rootI;
          rank[rootI]++;
          visualEdges.push({ from: rootJ, to: rootI });
        }
      }
    };

    // Calculate final static structure
    for (let i = 0; i < values.length; i += 2) {
      union(values[i], values[i + 1]);
    }

    // Add edges to graph input
    visualEdges.forEach((e) => {
      edges.push({
        id: `e${e.from}-${e.to}`,
        from: `n${e.from}`,
        to: `n${e.to}`,
        hidden: true,
      });
    });

    const initialGraph: GraphInput = {
      nodes: nodes.map((nd) => ({
        id: nd.id,
        label: nd.label,
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
      isDirected: true, // Directed edges to root
      layoutHint: "dagre",
    };

    // 2. Animate operations
    push({
      type: "SYSTEM_LOG",
      level: "INFO",
      message: "Initializing disjoint sets.",
    });

    // Show all nodes
    for (let i = 0; i < n; i++) {
      push({ type: "GRAPH_NODE_ADD", nodeId: `n${i}` });
    }

    // Reset state for simulation
    const simParent = Array.from({ length: n }, (_, i) => i);
    const simRank = Array(n).fill(0);

    const simFind = (i: number): number => {
      push({
        type: "GRAPH_NODE_HIGHLIGHT",
        nodeId: `n${i}`,
        status: "current",
      });
      if (simParent[i] !== i) {
        push({
          type: "SYSTEM_LOG",
          level: "INFO",
          message: `Path compression for ${i}`,
        });
        simParent[i] = simFind(simParent[i]);
      }
      return simParent[i];
    };

    const simUnion = (i: number, j: number) => {
      push({ type: "SYSTEM_LOG", level: "INFO", message: `Union(${i}, ${j})` });
      const rootI = simFind(i);
      const rootJ = simFind(j);

      if (rootI !== rootJ) {
        if (simRank[rootI] < simRank[rootJ]) {
          simParent[rootI] = rootJ;
          push({
            type: "GRAPH_EDGE_ADD",
            edgeId: `e${rootI}-${rootJ}`,
            from: `n${rootI}`,
            to: `n${rootJ}`,
          });
          push({
            type: "SYSTEM_LOG",
            level: "INFO",
            message: `${rootI} becomes child of ${rootJ}`,
          });
        } else if (simRank[rootI] > simRank[rootJ]) {
          simParent[rootJ] = rootI;
          push({
            type: "GRAPH_EDGE_ADD",
            edgeId: `e${rootJ}-${rootI}`,
            from: `n${rootJ}`,
            to: `n${rootI}`,
          });
          push({
            type: "SYSTEM_LOG",
            level: "INFO",
            message: `${rootJ} becomes child of ${rootI}`,
          });
        } else {
          simParent[rootJ] = rootI;
          simRank[rootI]++;
          push({
            type: "GRAPH_EDGE_ADD",
            edgeId: `e${rootJ}-${rootI}`,
            from: `n${rootJ}`,
            to: `n${rootI}`,
          });
          push({
            type: "SYSTEM_LOG",
            level: "INFO",
            message: `${rootJ} becomes child of ${rootI}, rank of ${rootI} increases`,
          });
        }
      } else {
        push({
          type: "SYSTEM_LOG",
          level: "WARN",
          message: `${i} and ${j} are already in the same set.`,
        });
      }
    };

    for (let i = 0; i < values.length; i += 2) {
      simUnion(values[i], values[i + 1]);
    }

    const endTime = performance.now();

    return {
      events,
      metadata: {
        timeComplexity: "O(α(n))",
        spaceComplexity: "O(n)",
        executionTimeMs: endTime - startTime,
        nodeCount: nodes.length,
        algorithmName: this.name,
        initialGraph,
      },
    };
  }
}
