import type {
  AlgorithmPlugin,
  ExecutionTrace,
  ArrayInput,
  GraphInput,
  VisualizationEvent,
  EventPayload,
} from "../../../types";

export class AVLTreePlugin implements AlgorithmPlugin<ArrayInput> {
  id = "avl";
  name = "AVL Tree";
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

    class AVLNode {
      value: number;
      id: string;
      height: number = 1;
      left: AVLNode | null = null;
      right: AVLNode | null = null;
      constructor(value: number, id: string) {
        this.value = value;
        this.id = id;
      }
    }

    let nextId = 0;

    const getHeight = (n: AVLNode | null) => (n ? n.height : 0);
    const getBalance = (n: AVLNode | null) =>
      n ? getHeight(n.left) - getHeight(n.right) : 0;
    const updateHeight = (n: AVLNode) => {
      n.height = Math.max(getHeight(n.left), getHeight(n.right)) + 1;
    };

    // Calculate dynamic layout for current state
    let lastCoords = new Map<string, {x: number, y: number}>();
    const updateLayout = (simRoot: AVLNode | null) => {
      if (!simRoot) return;
      let currentIndex = 0;
      const depths = new Map<string, number>();
      const inOrderIndices = new Map<string, number>();

      const traverse = (n: AVLNode | null, depth: number) => {
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

    const rightRotate = (y: AVLNode): AVLNode => {
      const x = y.left!;
      const T2 = x.right;
      
      push({ type: "GRAPH_EDGE_REMOVE", edgeId: `e${y.id}-${x.id}` });
      if (T2) push({ type: "GRAPH_EDGE_REMOVE", edgeId: `e${x.id}-${T2.id}` });
      
      x.right = y;
      y.left = T2;
      
      push({ type: "GRAPH_EDGE_ADD", edgeId: `e${x.id}-${y.id}`, from: x.id, to: y.id });
      if (T2) push({ type: "GRAPH_EDGE_ADD", edgeId: `e${y.id}-${T2.id}`, from: y.id, to: T2.id });

      updateHeight(y);
      updateHeight(x);
      return x;
    };

    const leftRotate = (x: AVLNode): AVLNode => {
      const y = x.right!;
      const T2 = y.left;
      
      push({ type: "GRAPH_EDGE_REMOVE", edgeId: `e${x.id}-${y.id}` });
      if (T2) push({ type: "GRAPH_EDGE_REMOVE", edgeId: `e${y.id}-${T2.id}` });

      y.left = x;
      x.right = T2;
      
      push({ type: "GRAPH_EDGE_ADD", edgeId: `e${y.id}-${x.id}`, from: y.id, to: x.id });
      if (T2) push({ type: "GRAPH_EDGE_ADD", edgeId: `e${x.id}-${T2.id}`, from: x.id, to: T2.id });

      updateHeight(x);
      updateHeight(y);
      return y;
    };

    const nodes: { id: string; label: string; hidden: boolean }[] = [];
    const edges: { id: string; from: string; to: string; hidden: boolean }[] = [];

    // Pre-create node data for the graph
    values.forEach((v) => {
      if (!nodes.find(n => n.label === String(v))) {
        nodes.push({ id: `n${nextId++}`, label: String(v), hidden: true });
      }
    });

    push({
      type: "SYSTEM_LOG",
      level: "INFO",
      message: "Starting AVL Tree construction.",
    });

    let simRoot: AVLNode | null = null;

    const simInsert = (
      node: AVLNode | null,
      val: number,
      parentId: string | null = null,
    ): AVLNode => {
      if (!node) {
        const targetId = nodes.find((n) => n.label === String(val))!.id;
        const newNode = new AVLNode(val, targetId);
        push({ type: "GRAPH_NODE_ADD", nodeId: targetId });
        
        // Temporarily put it at parent's pos or middle to animate from there
        const parentPos = parentId ? lastCoords.get(parentId) : null;
        const startX = parentPos ? parentPos.x : 400;
        const startY = parentPos ? parentPos.y : 80;
        push({ type: "GRAPH_NODE_MOVE", nodeId: targetId, x: startX, y: startY });
        lastCoords.set(targetId, { x: startX, y: startY });

        if (parentId) {
          push({
            type: "GRAPH_EDGE_ADD",
            edgeId: `e${parentId}-${targetId}`,
            from: parentId,
            to: targetId,
          });
          edges.push({ id: `e${parentId}-${targetId}`, from: parentId, to: targetId, hidden: true });
        }
        push({
          type: "GRAPH_NODE_HIGHLIGHT",
          nodeId: targetId,
          status: "visited",
        });
        return newNode;
      }

      push({
        type: "GRAPH_NODE_HIGHLIGHT",
        nodeId: node.id,
        status: "current",
      });

      if (val < node.value) {
        push({
          type: "SYSTEM_LOG",
          level: "INFO",
          message: `${val} < ${node.value}`,
        });
        if (node.left) {
          push({
            type: "GRAPH_EDGE_HIGHLIGHT",
            edgeId: `e${node.id}-${node.left.id}`,
            accepted: true,
          });
        }
        node.left = simInsert(node.left, val, node.id);
      } else if (val > node.value) {
        push({
          type: "SYSTEM_LOG",
          level: "INFO",
          message: `${val} > ${node.value}`,
        });
        if (node.right) {
          push({
            type: "GRAPH_EDGE_HIGHLIGHT",
            edgeId: `e${node.id}-${node.right.id}`,
            accepted: true,
          });
        }
        node.right = simInsert(node.right, val, node.id);
      } else {
        return node;
      }

      updateHeight(node);
      const balance = getBalance(node);

      if (balance > 1 && val < node.left!.value) {
        push({ type: "TREE_ROTATE", pivotId: node.id, direction: "RIGHT" });
        push({
          type: "SYSTEM_LOG",
          level: "WARN",
          message: `Right Rotation on ${node.value}`,
        });
        return rightRotate(node);
      }
      if (balance < -1 && val > node.right!.value) {
        push({ type: "TREE_ROTATE", pivotId: node.id, direction: "LEFT" });
        push({
          type: "SYSTEM_LOG",
          level: "WARN",
          message: `Left Rotation on ${node.value}`,
        });
        return leftRotate(node);
      }
      if (balance > 1 && val > node.left!.value) {
        push({
          type: "TREE_ROTATE",
          pivotId: node.left!.id,
          direction: "LEFT",
        });
        push({
          type: "SYSTEM_LOG",
          level: "WARN",
          message: `Left-Right Rotation starting on ${node.left!.value}`,
        });
        node.left = leftRotate(node.left!);
        push({ type: "TREE_ROTATE", pivotId: node.id, direction: "RIGHT" });
        return rightRotate(node);
      }
      if (balance < -1 && val < node.right!.value) {
        push({
          type: "TREE_ROTATE",
          pivotId: node.right!.id,
          direction: "RIGHT",
        });
        push({
          type: "SYSTEM_LOG",
          level: "WARN",
          message: `Right-Left Rotation starting on ${node.right!.value}`,
        });
        node.right = rightRotate(node.right!);
        push({ type: "TREE_ROTATE", pivotId: node.id, direction: "LEFT" });
        return leftRotate(node);
      }

      return node;
    };

    values.forEach((val) => {
      push({ type: "SYSTEM_LOG", level: "INFO", message: `Inserting ${val}` });
      simRoot = simInsert(simRoot, val);
      updateLayout(simRoot); // Animate the layout change after insertion and rotations!
    });

    // ── Final cleanup: clear all highlights so the tree looks clean ──
    push({ type: "SYSTEM_LOG", level: "INFO", message: "AVL Tree construction complete." });

    // Reset all edge highlights to default
    for (const e of edges) {
      push({ type: "GRAPH_EDGE_HIGHLIGHT", edgeId: e.id, status: "default" });
    }

    // Set all nodes to finished (clean) state
    for (const n of nodes) {
      push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: n.id, status: "finished" });
    }

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

    const endTime = performance.now();

    return {
      events,
      metadata: {
        timeComplexity: "O(log n)",
        spaceComplexity: "O(n)",
        executionTimeMs: endTime - startTime,
        nodeCount: nodes.length,
        algorithmName: this.name,
        initialGraph,
      },
    };
  }
}
