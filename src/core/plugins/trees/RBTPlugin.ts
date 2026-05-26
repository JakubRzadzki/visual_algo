import type {
  AlgorithmPlugin,
  ExecutionTrace,
  ArrayInput,
  GraphInput,
  VisualizationEvent,
  EventPayload,
} from "../../../types";

export class RBTPlugin implements AlgorithmPlugin<ArrayInput> {
  id = "rbt";
  name = "Red-Black Tree";
  category = "tree" as const;

  execute(data: ArrayInput): ExecutionTrace {
    const values =
      data.values && data.values.length > 0
        ? data.values
        : [10, 20, 30, 40, 50, 25];
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

    type Color = "red" | "black";

    class RBTNode {
      value: number;
      id: string;
      color: Color = "red";
      left: RBTNode | null = null;
      right: RBTNode | null = null;
      parent: RBTNode | null = null;
      constructor(value: number, id: string) {
        this.value = value;
        this.id = id;
      }
    }

    let nextId = 0;
    let root: RBTNode | null = null;

    const nodes: { id: string; label: string; hidden: boolean }[] = [];
    const edges: { id: string; from: string; to: string; hidden: boolean }[] = [];

    // Phase 1: Build static layout graph using standard insertion without emitting steps
    let staticRoot: RBTNode | null = null;

    const staticInsert = (value: number) => {
      const newNode = new RBTNode(value, `n${nextId++}`);
      let parent: RBTNode | null = null;
      let curr = staticRoot;
      while (curr) {
        parent = curr;
        if (value < curr.value) curr = curr.left;
        else curr = curr.right;
      }
      newNode.parent = parent;
      if (!parent) staticRoot = newNode;
      else if (value < parent.value) parent.left = newNode;
      else parent.right = newNode;
      staticFixInsert(newNode);
    };

    const staticLeftRotate = (x: RBTNode) => {
      const y = x.right!;
      x.right = y.left;
      if (y.left) y.left.parent = x;
      y.parent = x.parent;
      if (!x.parent) staticRoot = y;
      else if (x === x.parent.left) x.parent.left = y;
      else x.parent.right = y;
      y.left = x;
      x.parent = y;
    };

    const staticRightRotate = (y: RBTNode) => {
      const x = y.left!;
      y.left = x.right;
      if (x.right) x.right.parent = y;
      x.parent = y.parent;
      if (!y.parent) staticRoot = x;
      else if (y === y.parent.right) y.parent.right = x;
      else y.parent.left = x;
      x.right = y;
      y.parent = x;
    };

    const staticFixInsert = (node: RBTNode) => {
      while (node.parent && node.parent.color === "red") {
        if (node.parent === node.parent.parent!.left) {
          const uncle = node.parent.parent!.right;
          if (uncle && uncle.color === "red") {
            node.parent.color = "black";
            uncle.color = "black";
            node.parent.parent!.color = "red";
            node = node.parent.parent!;
          } else {
            if (node === node.parent.right) {
              node = node.parent;
              staticLeftRotate(node);
            }
            node.parent!.color = "black";
            node.parent!.parent!.color = "red";
            staticRightRotate(node.parent!.parent!);
          }
        } else {
          const uncle = node.parent.parent!.left;
          if (uncle && uncle.color === "red") {
            node.parent.color = "black";
            uncle.color = "black";
            node.parent.parent!.color = "red";
            node = node.parent.parent!;
          } else {
            if (node === node.parent.left) {
              node = node.parent;
              staticRightRotate(node);
            }
            node.parent!.color = "black";
            node.parent!.parent!.color = "red";
            staticLeftRotate(node.parent!.parent!);
          }
        }
      }
      staticRoot!.color = "black";
    };

    values.forEach((v) => staticInsert(v));

    const traverse = (n: RBTNode | null) => {
      if (!n) return;
      nodes.push({ id: n.id, label: String(n.value), hidden: true });
      if (n.left) {
        edges.push({ id: `e${n.id}-${n.left.id}`, from: n.id, to: n.left.id, hidden: true });
        traverse(n.left);
      }
      if (n.right) {
        edges.push({ id: `e${n.id}-${n.right.id}`, from: n.id, to: n.right.id, hidden: true });
        traverse(n.right);
      }
    };
    traverse(staticRoot);

    // Phase 2: Sim insertion with events
    push({ type: "SYSTEM_LOG", level: "INFO", message: "Starting RBT construction." });

    const simLeftRotate = (x: RBTNode) => {
      push({ type: "TREE_ROTATE", pivotId: x.id, direction: "LEFT" });
      const y = x.right!;
      x.right = y.left;
      if (y.left) y.left.parent = x;
      y.parent = x.parent;
      if (!x.parent) root = y;
      else if (x === x.parent.left) x.parent.left = y;
      else x.parent.right = y;
      y.left = x;
      x.parent = y;
    };

    const simRightRotate = (y: RBTNode) => {
      push({ type: "TREE_ROTATE", pivotId: y.id, direction: "RIGHT" });
      const x = y.left!;
      y.left = x.right;
      if (x.right) x.right.parent = y;
      x.parent = y.parent;
      if (!y.parent) root = x;
      else if (y === y.parent.right) y.parent.right = x;
      else y.parent.left = x;
      x.right = y;
      y.parent = x;
    };

    const simFixInsert = (node: RBTNode) => {
      while (node.parent && node.parent.color === "red") {
        if (node.parent === node.parent.parent!.left) {
          const uncle = node.parent.parent!.right;
          if (uncle && uncle.color === "red") {
            push({ type: "SYSTEM_LOG", level: "WARN", message: `Recoloring ${node.parent.value}, ${uncle.value} and ${node.parent.parent!.value}` });
            node.parent.color = "black";
            uncle.color = "black";
            node.parent.parent!.color = "red";
            node = node.parent.parent!;
          } else {
            if (node === node.parent.right) {
              node = node.parent;
              push({ type: "SYSTEM_LOG", level: "WARN", message: `Left rotate on ${node.value}` });
              simLeftRotate(node);
            }
            node.parent!.color = "black";
            node.parent!.parent!.color = "red";
            push({ type: "SYSTEM_LOG", level: "WARN", message: `Right rotate on ${node.parent!.parent!.value}` });
            simRightRotate(node.parent!.parent!);
          }
        } else {
          const uncle = node.parent.parent!.left;
          if (uncle && uncle.color === "red") {
            push({ type: "SYSTEM_LOG", level: "WARN", message: `Recoloring ${node.parent.value}, ${uncle.value} and ${node.parent.parent!.value}` });
            node.parent.color = "black";
            uncle.color = "black";
            node.parent.parent!.color = "red";
            node = node.parent.parent!;
          } else {
            if (node === node.parent.left) {
              node = node.parent;
              push({ type: "SYSTEM_LOG", level: "WARN", message: `Right rotate on ${node.value}` });
              simRightRotate(node);
            }
            node.parent!.color = "black";
            node.parent!.parent!.color = "red";
            push({ type: "SYSTEM_LOG", level: "WARN", message: `Left rotate on ${node.parent!.parent!.value}` });
            simLeftRotate(node.parent!.parent!);
          }
        }
      }
      root!.color = "black";
    };

    const simInsert = (value: number) => {
      const targetNodeData = nodes.find(n => n.label === String(value) && !events.find(e => e.type === "GRAPH_NODE_ADD" && e.nodeId === n.id));
      if (!targetNodeData) return;
      const targetId = targetNodeData.id;
      
      push({ type: "SYSTEM_LOG", level: "INFO", message: `Inserting ${value}` });
      const newNode = new RBTNode(value, targetId);
      push({ type: "GRAPH_NODE_ADD", nodeId: targetId });
      push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: targetId, status: "visited" });

      let parent: RBTNode | null = null;
      let curr = root;
      while (curr) {
        parent = curr;
        push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: curr.id, status: "current" });
        if (value < curr.value) {
          if (curr.left) push({ type: "GRAPH_EDGE_HIGHLIGHT", edgeId: `e${curr.id}-${curr.left.id}`, accepted: true });
          curr = curr.left;
        } else {
          if (curr.right) push({ type: "GRAPH_EDGE_HIGHLIGHT", edgeId: `e${curr.id}-${curr.right.id}`, accepted: true });
          curr = curr.right;
        }
      }

      newNode.parent = parent;
      if (!parent) {
        root = newNode;
      } else {
        push({ type: "GRAPH_EDGE_ADD", edgeId: `e${parent.id}-${targetId}`, from: parent.id, to: targetId });
        if (value < parent.value) parent.left = newNode;
        else parent.right = newNode;
      }

      simFixInsert(newNode);
    };

    values.forEach(v => simInsert(v));

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

    return {
      events,
      metadata: {
        timeComplexity: "O(log n)",
        spaceComplexity: "O(n)",
        executionTimeMs: performance.now() - startTime,
        nodeCount: nodes.length,
        algorithmName: this.name,
        initialGraph,
      },
    };
  }
}
