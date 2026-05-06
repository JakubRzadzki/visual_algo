import type { AlgorithmPlugin, ExecutionTrace, ArrayInput, GraphInput, VisualizationEvent, EventPayload } from '../../../types';

export class AVLTreePlugin implements AlgorithmPlugin<ArrayInput> {
  id = 'avl';
  name = 'AVL Tree';
  category = 'tree' as const;

  execute(data: ArrayInput): ExecutionTrace {
    const values = data.values && data.values.length > 0 ? data.values : [10, 20, 30, 40, 50, 25];
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

    let root: AVLNode | null = null;
    let nextId = 0;

    const getHeight = (n: AVLNode | null) => n ? n.height : 0;
    const getBalance = (n: AVLNode | null) => n ? getHeight(n.left) - getHeight(n.right) : 0;
    const updateHeight = (n: AVLNode) => {
      n.height = Math.max(getHeight(n.left), getHeight(n.right)) + 1;
    };

    const rightRotate = (y: AVLNode): AVLNode => {
      const x = y.left!;
      const T2 = x.right;
      x.right = y;
      y.left = T2;
      updateHeight(y);
      updateHeight(x);
      return x;
    };

    const leftRotate = (x: AVLNode): AVLNode => {
      const y = x.right!;
      const T2 = y.left;
      y.left = x;
      x.right = T2;
      updateHeight(x);
      updateHeight(y);
      return y;
    };

    const insert = (node: AVLNode | null, val: number): AVLNode => {
      if (!node) return new AVLNode(val, `n${nextId++}`);

      if (val < node.value) {
        node.left = insert(node.left, val);
      } else if (val > node.value) {
        node.right = insert(node.right, val);
      } else {
        return node;
      }

      updateHeight(node);
      const balance = getBalance(node);

      // LL
      if (balance > 1 && val < node.left!.value) {
        return rightRotate(node);
      }
      // RR
      if (balance < -1 && val > node.right!.value) {
        return leftRotate(node);
      }
      // LR
      if (balance > 1 && val > node.left!.value) {
        node.left = leftRotate(node.left!);
        return rightRotate(node);
      }
      // RL
      if (balance < -1 && val < node.right!.value) {
        node.right = rightRotate(node.right!);
        return leftRotate(node);
      }

      return node;
    };

    // 1. Build the final tree to get the static layout
    values.forEach(v => {
      root = insert(root, v);
    });

    const nodes: { id: string; label: string; hidden: boolean }[] = [];
    const edges: { id: string; from: string; to: string; hidden: boolean }[] = [];

    const traverse = (n: AVLNode | null) => {
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
    traverse(root);

    // 2. Animate the insertion process (Logical path through the final tree)
    push({ type: 'SYSTEM_LOG', level: 'INFO', message: 'Starting AVL Tree construction.' });

    let simRoot: AVLNode | null = null;

    const simInsert = (node: AVLNode | null, val: number, parentId: string | null = null): AVLNode => {
      if (!node) {
        const targetId = nodes.find(n => n.label === String(val))!.id;
        const newNode = new AVLNode(val, targetId);
        push({ type: 'GRAPH_NODE_ADD', nodeId: targetId });
        if (parentId) {
          push({ type: 'GRAPH_EDGE_ADD', edgeId: `e${parentId}-${targetId}`, from: parentId, to: targetId });
        }
        push({ type: 'GRAPH_NODE_HIGHLIGHT', nodeId: targetId, status: 'visited' });
        return newNode;
      }

      push({ type: 'GRAPH_NODE_HIGHLIGHT', nodeId: node.id, status: 'current' });

      if (val < node.value) {
        push({ type: 'SYSTEM_LOG', level: 'INFO', message: `${val} < ${node.value}` });
        if (node.left) {
            push({ type: 'GRAPH_EDGE_HIGHLIGHT', edgeId: `e${node.id}-${node.left.id}`, accepted: true });
        }
        node.left = simInsert(node.left, val, node.id);
      } else if (val > node.value) {
        push({ type: 'SYSTEM_LOG', level: 'INFO', message: `${val} > ${node.value}` });
        if (node.right) {
            push({ type: 'GRAPH_EDGE_HIGHLIGHT', edgeId: `e${node.id}-${node.right.id}`, accepted: true });
        }
        node.right = simInsert(node.right, val, node.id);
      } else {
        return node;
      }

      updateHeight(node);
      const balance = getBalance(node);

      if (balance > 1 && val < node.left!.value) {
        push({ type: 'TREE_ROTATE', pivotId: node.id, direction: 'RIGHT' });
        push({ type: 'SYSTEM_LOG', level: 'WARN', message: `Right Rotation on ${node.value}` });
        return rightRotate(node);
      }
      if (balance < -1 && val > node.right!.value) {
        push({ type: 'TREE_ROTATE', pivotId: node.id, direction: 'LEFT' });
        push({ type: 'SYSTEM_LOG', level: 'WARN', message: `Left Rotation on ${node.value}` });
        return leftRotate(node);
      }
      if (balance > 1 && val > node.left!.value) {
        push({ type: 'TREE_ROTATE', pivotId: node.left!.id, direction: 'LEFT' });
        push({ type: 'SYSTEM_LOG', level: 'WARN', message: `Left-Right Rotation starting on ${node.left!.value}` });
        node.left = leftRotate(node.left!);
        push({ type: 'TREE_ROTATE', pivotId: node.id, direction: 'RIGHT' });
        return rightRotate(node);
      }
      if (balance < -1 && val < node.right!.value) {
        push({ type: 'TREE_ROTATE', pivotId: node.right!.id, direction: 'RIGHT' });
        push({ type: 'SYSTEM_LOG', level: 'WARN', message: `Right-Left Rotation starting on ${node.right!.value}` });
        node.right = rightRotate(node.right!);
        push({ type: 'TREE_ROTATE', pivotId: node.id, direction: 'LEFT' });
        return leftRotate(node);
      }

      return node;
    };

    values.forEach(val => {
      push({ type: 'SYSTEM_LOG', level: 'INFO', message: `Inserting ${val}` });
      simRoot = simInsert(simRoot, val);
    });

    const initialGraph: GraphInput = {
      nodes: nodes.map(n => ({ id: n.id, label: n.label, x: 0, y: 0, vx: 0, vy: 0, hidden: true })),
      edges: edges.map(e => ({ id: e.id, from: e.from, to: e.to, weight: 0, hidden: true })),
      isDirected: true,
      layoutHint: 'dagre',
    };

    const endTime = performance.now();

    return {
      events,
      metadata: {
        timeComplexity: 'O(log n)',
        spaceComplexity: 'O(n)',
        executionTimeMs: endTime - startTime,
        nodeCount: nodes.length,
        algorithmName: this.name,
        initialGraph,
      },
    };
  }
}
