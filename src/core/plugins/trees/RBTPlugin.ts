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

    // Calculate dynamic layout for current state
    let lastCoords = new Map<string, {x: number, y: number}>();
    const updateLayout = (simRoot: RBTNode | null) => {
      if (!simRoot) return;
      let currentIndex = 0;
      const depths = new Map<string, number>();
      const inOrderIndices = new Map<string, number>();

      const traverse = (n: RBTNode | null, depth: number) => {
        if (!n) return;
        depths.set(n.id, depth);
        traverse(n.left, depth + 1);
        inOrderIndices.set(n.id, currentIndex++);
        traverse(n.right, depth + 1);
      };

      traverse(simRoot, 0);

      const SVG_WIDTH = 800;
      const SVG_HEIGHT = 600;
      const paddingX = 60;
      const paddingY = 80;
      
      const totalNodes = currentIndex;
      const maxDepth = Math.max(0, ...Array.from(depths.values()));

      const stepX = totalNodes > 1 ? (SVG_WIDTH - 2 * paddingX) / (totalNodes - 1) : 0;
      const stepY = maxDepth > 0 ? (SVG_HEIGHT - 2 * paddingY) / maxDepth : 0;

      for (const [id, idx] of inOrderIndices.entries()) {
        const d = depths.get(id) || 0;
        const x = totalNodes === 1 ? SVG_WIDTH / 2 : paddingX + idx * stepX;
        const y = paddingY + d * Math.min(stepY, 120);
        
        const old = lastCoords.get(id);
        if (!old || old.x !== x || old.y !== y) {
          push({ type: "GRAPH_NODE_MOVE", nodeId: id, x, y });
          lastCoords.set(id, { x, y });
        }
      }
    };

    // Pre-create node data for the graph to have IDs stable
    values.forEach((v) => {
      if (!nodes.find(n => n.label === String(v))) {
        nodes.push({ id: `n${nextId++}`, label: String(v), hidden: true });
      }
    });

    // Phase 2: Sim insertion with events
    push({ type: "SYSTEM_LOG", level: "INFO", message: "Starting RBT construction." });

    const simLeftRotate = (x: RBTNode) => {
      push({ type: "TREE_ROTATE", pivotId: x.id, direction: "LEFT" });
      const y = x.right!;
      
      push({ type: "GRAPH_EDGE_REMOVE", edgeId: `e${x.id}-${y.id}` });
      if (y.left) push({ type: "GRAPH_EDGE_REMOVE", edgeId: `e${y.id}-${y.left.id}` });
      if (x.parent) {
        push({ type: "GRAPH_EDGE_REMOVE", edgeId: `e${x.parent.id}-${x.id}` });
      }

      x.right = y.left;
      if (y.left) {
        y.left.parent = x;
        push({ type: "GRAPH_EDGE_ADD", edgeId: `e${x.id}-${y.left.id}`, from: x.id, to: y.left.id });
      }
      y.parent = x.parent;
      if (!x.parent) {
        root = y;
      } else if (x === x.parent.left) {
        x.parent.left = y;
        push({ type: "GRAPH_EDGE_ADD", edgeId: `e${x.parent.id}-${y.id}`, from: x.parent.id, to: y.id });
      } else {
        x.parent.right = y;
        push({ type: "GRAPH_EDGE_ADD", edgeId: `e${x.parent.id}-${y.id}`, from: x.parent.id, to: y.id });
      }
      y.left = x;
      x.parent = y;
      push({ type: "GRAPH_EDGE_ADD", edgeId: `e${y.id}-${x.id}`, from: y.id, to: x.id });
    };

    const simRightRotate = (y: RBTNode) => {
      push({ type: "TREE_ROTATE", pivotId: y.id, direction: "RIGHT" });
      const x = y.left!;
      
      push({ type: "GRAPH_EDGE_REMOVE", edgeId: `e${y.id}-${x.id}` });
      if (x.right) push({ type: "GRAPH_EDGE_REMOVE", edgeId: `e${x.id}-${x.right.id}` });
      if (y.parent) {
        push({ type: "GRAPH_EDGE_REMOVE", edgeId: `e${y.parent.id}-${y.id}` });
      }

      y.left = x.right;
      if (x.right) {
        x.right.parent = y;
        push({ type: "GRAPH_EDGE_ADD", edgeId: `e${y.id}-${x.right.id}`, from: y.id, to: x.right.id });
      }
      x.parent = y.parent;
      if (!y.parent) {
        root = x;
      } else if (y === y.parent.right) {
        y.parent.right = x;
        push({ type: "GRAPH_EDGE_ADD", edgeId: `e${y.parent.id}-${x.id}`, from: y.parent.id, to: x.id });
      } else {
        y.parent.left = x;
        push({ type: "GRAPH_EDGE_ADD", edgeId: `e${y.parent.id}-${x.id}`, from: y.parent.id, to: x.id });
      }
      x.right = y;
      y.parent = x;
      push({ type: "GRAPH_EDGE_ADD", edgeId: `e${x.id}-${y.id}`, from: x.id, to: y.id });
    };

    const simFixInsert = (node: RBTNode) => {
      while (node.parent && node.parent.color === "red") {
        if (node.parent === node.parent.parent!.left) {
          const uncle = node.parent.parent!.right;
          if (uncle && uncle.color === "red") {
            push({ type: "SYSTEM_LOG", level: "WARN", message: `Recoloring ${node.parent.value}, ${uncle.value} and ${node.parent.parent!.value}` });
            node.parent.color = "black";
            push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: node.parent.id, status: "black" });
            uncle.color = "black";
            push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: uncle.id, status: "black" });
            node.parent.parent!.color = "red";
            push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: node.parent.parent!.id, status: "red" });
            node = node.parent.parent!;
          } else {
            if (node === node.parent.right) {
              node = node.parent;
              push({ type: "SYSTEM_LOG", level: "WARN", message: `Left rotate on ${node.value}` });
              simLeftRotate(node);
              updateLayout(root);
            }
            node.parent!.color = "black";
            push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: node.parent!.id, status: "black" });
            node.parent!.parent!.color = "red";
            push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: node.parent!.parent!.id, status: "red" });
            push({ type: "SYSTEM_LOG", level: "WARN", message: `Right rotate on ${node.parent!.parent!.value}` });
            simRightRotate(node.parent!.parent!);
            updateLayout(root);
          }
        } else {
          const uncle = node.parent.parent!.left;
          if (uncle && uncle.color === "red") {
            push({ type: "SYSTEM_LOG", level: "WARN", message: `Recoloring ${node.parent.value}, ${uncle.value} and ${node.parent.parent!.value}` });
            node.parent.color = "black";
            push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: node.parent.id, status: "black" });
            uncle.color = "black";
            push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: uncle.id, status: "black" });
            node.parent.parent!.color = "red";
            push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: node.parent.parent!.id, status: "red" });
            node = node.parent.parent!;
          } else {
            if (node === node.parent.left) {
              node = node.parent;
              push({ type: "SYSTEM_LOG", level: "WARN", message: `Right rotate on ${node.value}` });
              simRightRotate(node);
              updateLayout(root);
            }
            node.parent!.color = "black";
            push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: node.parent!.id, status: "black" });
            node.parent!.parent!.color = "red";
            push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: node.parent!.parent!.id, status: "red" });
            push({ type: "SYSTEM_LOG", level: "WARN", message: `Left rotate on ${node.parent!.parent!.value}` });
            simLeftRotate(node.parent!.parent!);
            updateLayout(root);
          }
        }
      }
      root!.color = "black";
      push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: root!.id, status: "black" });
    };

    const simInsert = (value: number) => {
      const targetNodeData = nodes.find(n => n.label === String(value) && !events.find(e => e.type === "GRAPH_NODE_ADD" && e.nodeId === n.id));
      if (!targetNodeData) return;
      const targetId = targetNodeData.id;
      
      push({ type: "SYSTEM_LOG", level: "INFO", message: `Inserting ${value}` });
      const newNode = new RBTNode(value, targetId);
      push({ type: "GRAPH_NODE_ADD", nodeId: targetId });
      
      push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: targetId, status: "red" });

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

      // Temporarily put it at parent's pos or middle to animate from there
      const parentPos = parent ? lastCoords.get(parent.id) : null;
      const startX = parentPos ? parentPos.x : 400;
      const startY = parentPos ? parentPos.y : 80;
      push({ type: "GRAPH_NODE_MOVE", nodeId: targetId, x: startX, y: startY });
      lastCoords.set(targetId, { x: startX, y: startY });

      newNode.parent = parent;
      if (!parent) {
        root = newNode;
      } else {
        push({ type: "GRAPH_EDGE_ADD", edgeId: `e${parent.id}-${targetId}`, from: parent.id, to: targetId });
        edges.push({ id: `e${parent.id}-${targetId}`, from: parent.id, to: targetId, hidden: true });
        if (value < parent.value) parent.left = newNode;
        else parent.right = newNode;
      }

      updateLayout(root);
      simFixInsert(newNode);
    };

    values.forEach(v => simInsert(v));

    const initialGraph: GraphInput = {
      nodes: nodes.map((n) => ({
        id: n.id,
        label: n.label,
        x: lastCoords.get(n.id)?.x || 0,
        y: lastCoords.get(n.id)?.y || 0,
        vx: 0,
        vy: 0,
        hidden: true,
      })),
      edges: edges.map(e => ({ ...e, weight: 0 })),
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
