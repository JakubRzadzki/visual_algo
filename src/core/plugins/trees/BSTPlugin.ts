import type { AlgorithmPlugin, ExecutionTrace, ArrayInput, GraphInput, VisualizationEvent, EventPayload } from '../../../types';

export class BSTPlugin implements AlgorithmPlugin<ArrayInput> {
  id = 'bst';
  name = 'Binary Search Tree';
  category = 'tree' as const;

  execute(data: ArrayInput): ExecutionTrace {
    const values = data.values && data.values.length > 0 ? data.values : [15, 10, 20, 8, 12, 17, 25];
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

    const nodes: { id: string; label: string; value: number; x: number; y: number; hidden: boolean }[] = [];
    const edges: { id: string; from: string; to: string; weight: number; hidden: boolean }[] = [];

    // Tree representation for building
    class TreeNode {
      value: number;
      id: string;
      left: TreeNode | null = null;
      right: TreeNode | null = null;
      constructor(value: number, id: string) {
        this.value = value;
        this.id = id;
      }
    }

    let root: TreeNode | null = null;
    let nextId = 0;

    // Simulate the build and collect the final structure
    const buildTree = (val: number): TreeNode => {
      const newNode = new TreeNode(val, `n${nextId++}`);
      nodes.push({ id: newNode.id, label: String(val), value: val, x: 0, y: 0, hidden: true });
      if (!root) {
        root = newNode;
        return newNode;
      }
      let curr = root;
      while (true) {
        if (val < curr.value) {
          if (!curr.left) {
            curr.left = newNode;
            edges.push({ id: `e${curr.id}-${newNode.id}`, from: curr.id, to: newNode.id, weight: 0, hidden: true });
            break;
          }
          curr = curr.left;
        } else {
          if (!curr.right) {
            curr.right = newNode;
            edges.push({ id: `e${curr.id}-${newNode.id}`, from: curr.id, to: newNode.id, weight: 0, hidden: true });
            break;
          }
          curr = curr.right;
        }
      }
      return newNode;
    };

    // Build the full graph structure first (silently)
    values.forEach(v => buildTree(v));

    // Now, simulate the insertion step-by-step for the trace
    push({ type: 'SYSTEM_LOG', level: 'INFO', message: 'Starting Binary Search Tree construction.' });
    
    let simRoot: TreeNode | null = null;

    values.forEach((val) => {
      push({ type: 'SYSTEM_LOG', level: 'INFO', message: `Inserting ${val}` });
      const targetNodeId = nodes.find(n => n.value === val)?.id;
      if (!targetNodeId) return;

      if (!simRoot) {
        simRoot = new TreeNode(val, targetNodeId);
        push({ type: 'GRAPH_NODE_ADD', nodeId: targetNodeId });
        push({ type: 'GRAPH_NODE_HIGHLIGHT', nodeId: targetNodeId, status: 'current' });
      } else {
        let curr = simRoot;
        while (true) {
          push({ type: 'GRAPH_NODE_HIGHLIGHT', nodeId: curr.id, status: 'current' });
          if (val < curr.value) {
            push({ type: 'SYSTEM_LOG', level: 'INFO', message: `${val} < ${curr.value}, going left.` });
            if (!curr.left) {
              curr.left = new TreeNode(val, targetNodeId);
              push({ type: 'GRAPH_NODE_ADD', nodeId: targetNodeId });
              push({ type: 'GRAPH_EDGE_ADD', edgeId: `e${curr.id}-${targetNodeId}`, from: curr.id, to: targetNodeId });
              push({ type: 'GRAPH_NODE_HIGHLIGHT', nodeId: targetNodeId, status: 'visited' });
              break;
            }
            const edgeId = `e${curr.id}-${curr.left.id}`;
            push({ type: 'GRAPH_EDGE_HIGHLIGHT', edgeId, accepted: true });
            curr = curr.left;
          } else {
            push({ type: 'SYSTEM_LOG', level: 'INFO', message: `${val} >= ${curr.value}, going right.` });
            if (!curr.right) {
              curr.right = new TreeNode(val, targetNodeId);
              push({ type: 'GRAPH_NODE_ADD', nodeId: targetNodeId });
              push({ type: 'GRAPH_EDGE_ADD', edgeId: `e${curr.id}-${targetNodeId}`, from: curr.id, to: targetNodeId });
              push({ type: 'GRAPH_NODE_HIGHLIGHT', nodeId: targetNodeId, status: 'visited' });
              break;
            }
            const edgeId = `e${curr.id}-${curr.right.id}`;
            push({ type: 'GRAPH_EDGE_HIGHLIGHT', edgeId, accepted: true });
            curr = curr.right;
          }
        }
      }
    });

    push({ type: 'SYSTEM_LOG', level: 'INFO', message: 'BST construction complete.' });

    const initialGraph: GraphInput = {
      nodes: nodes.map(n => ({ id: n.id, label: n.label, x: 0, y: 0, vx: 0, vy: 0, hidden: true })),
      edges: edges,
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
