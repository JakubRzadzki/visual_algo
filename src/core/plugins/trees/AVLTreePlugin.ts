import type {
  AlgorithmPlugin,
  ExecutionTrace,
  ArrayInput,
  GraphInput,
  VisualizationEvent,
  EventPayload,
} from "../../../types";

/**
 * AVLTreePlugin — builds a self-balancing AVL tree and emits a visualization
 * trace of insertions, rotations and the resulting re-layout.
 *
 * Implementation notes for nice rotation animations:
 * - Nodes carry parent pointers and there is a single global `root`, so the
 *   tree can be reconciled + re-laid-out after EACH rotation (not just per
 *   insert). That makes every rotation a discrete, visible step.
 * - Layout is positional (root centered, children offset left/right, spacing
 *   halves per depth). Unlike an in-order layout — which is invariant under
 *   rotation — this makes rotated nodes physically swap places on screen.
 */
export class AVLTreePlugin implements AlgorithmPlugin<ArrayInput> {
  id = "avl";
  name = "AVL Tree";
  category = "tree" as const;

  execute(data: ArrayInput): ExecutionTrace {
    const values =
      data.values && data.values.length > 0
        ? data.values
        : [50, 25, 10, 75, 100, 60, 65];
    const events: VisualizationEvent[] = [];
    let step = 0;
    const startTime = performance.now();

    const push = (evt: EventPayload, incrementStep: boolean = true) => {
      events.push({
        ...evt,
        id: crypto.randomUUID(),
        timestamp: performance.now(),
        step: step,
      });
      if (incrementStep) step++;
    };

    // ── AVL Node (with parent pointer) ────────────────────────────────────
    class AVLNode {
      value: number;
      id: string;
      height = 1;
      left: AVLNode | null = null;
      right: AVLNode | null = null;
      parent: AVLNode | null = null;
      constructor(value: number, id: string) {
        this.value = value;
        this.id = id;
      }
    }

    let nextId = 0;
    let root: AVLNode | null = null;

    const getHeight = (n: AVLNode | null) => (n ? n.height : 0);
    const getBalance = (n: AVLNode | null) =>
      n ? getHeight(n.left) - getHeight(n.right) : 0;
    const updateHeight = (n: AVLNode) => {
      n.height = Math.max(getHeight(n.left), getHeight(n.right)) + 1;
    };

    const nodes: { id: string; label: string; hidden: boolean }[] = [];
    const edges: { id: string; from: string; to: string; hidden: boolean }[] =
      [];

    // ── Positional layout: root centered, children offset, spacing halves ──
    const CENTER_X = 400;
    const TOP_Y = 70;
    const LEVEL_H = 92;
    const ROOT_SPREAD = 180;

    const lastCoords = new Map<string, { x: number; y: number }>();
    const updateLayout = () => {
      const place = (n: AVLNode | null, x: number, y: number, spread: number) => {
        if (!n) return;
        const old = lastCoords.get(n.id);
        if (!old || old.x !== x || old.y !== y) {
          push({ type: "GRAPH_NODE_MOVE", nodeId: n.id, x, y }, false);
          lastCoords.set(n.id, { x, y });
        }
        place(n.left, x - spread, y + LEVEL_H, spread * 0.5);
        place(n.right, x + spread, y + LEVEL_H, spread * 0.5);
      };
      place(root, CENTER_X, TOP_Y, ROOT_SPREAD);
    };

    // ── Edge reconciliation against the actual tree structure ──
    const activeEdges = new Set<string>();
    const reconcileEdges = () => {
      const desired = new Map<string, { from: string; to: string }>();
      const walk = (n: AVLNode | null) => {
        if (!n) return;
        if (n.left) {
          desired.set(`e${n.id}-${n.left.id}`, { from: n.id, to: n.left.id });
          walk(n.left);
        }
        if (n.right) {
          desired.set(`e${n.id}-${n.right.id}`, { from: n.id, to: n.right.id });
          walk(n.right);
        }
      };
      walk(root);

      for (const id of Array.from(activeEdges)) {
        if (!desired.has(id)) {
          push({ type: "GRAPH_EDGE_REMOVE", edgeId: id }, false);
          activeEdges.delete(id);
        }
      }
      for (const [id, e] of desired.entries()) {
        if (!activeEdges.has(id)) {
          push({ type: "GRAPH_EDGE_ADD", edgeId: id, from: e.from, to: e.to }, false);
          if (!edges.find((x) => x.id === id)) {
            edges.push({ id, from: e.from, to: e.to, hidden: true });
          }
          activeEdges.add(id);
        }
      }
    };

    /** Re-sync edges + positions to the current tree atomically. */
    const syncTree = () => {
      // Temporarily hijack push to not increment step so it all happens atomically
      const oldStep = step;
      reconcileEdges();
      updateLayout();
      // Ensure all these layout events share the same step number, then manually increment once
      step = oldStep + 1;
    };

    // ── Rotations described as a NODE SWAP (rise / fall / subtree transfer) ──

    /** LEFT rotation on [x]: its RIGHT child [y] rises, [x] falls. */
    const leftRotate = (x: AVLNode): AVLNode => {
      const y = x.right!; // pivot — the node that rises
      const mid = y.left; // middle subtree that must be transferred
      
      push({
        type: "SYSTEM_LOG",
        level: "WARN",
        message: `Identyfikacja węzłów: [parent]=${x.value} oraz jego PRAWE dziecko [pivot]=${y.value}.`,
      });
      push({
        type: "SYSTEM_LOG",
        level: "WARN",
        message: `[pivot] ${y.value} WZNOSI SIĘ w górę — przejmuje miejsce węzła [parent] ${x.value}.`,
      });
      push({
        type: "SYSTEM_LOG",
        level: "WARN",
        message: `[parent] ${x.value} OPADA w dół — staje się LEWYM dzieckiem węzła [pivot] ${y.value}.`,
      });
      push({
        type: "SYSTEM_LOG",
        level: "INFO",
        message: `Oryginalne LEWE poddrzewo węzła [pivot] ${y.value}${mid ? ` (korzeń ${mid.value})` : ` (null)`} zostaje przeniesione i staje się NOWYM PRAWYM dzieckiem węzła [parent] ${x.value}. (Wartości są < ${y.value} i > ${x.value}).`,
      });

      x.right = y.left;
      if (y.left) y.left.parent = x;
      y.parent = x.parent;
      if (!x.parent) root = y;
      else if (x === x.parent.left) x.parent.left = y;
      else x.parent.right = y;
      y.left = x;
      x.parent = y;
      updateHeight(x);
      updateHeight(y);
      
      push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: x.id, status: "rotate" }, false);
      push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: y.id, status: "rotate" });
      
      syncTree();
      
      push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: x.id, status: "default" }, false);
      push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: y.id, status: "default" }, false);
      
      push({
        type: "SYSTEM_LOG",
        level: "INFO",
        message: `Zaktualizowano balance factors dla ${x.value} i ${y.value}.`,
      });
      return y;
    };

    /** RIGHT rotation on [y]: its LEFT child [x] rises, [y] falls. */
    const rightRotate = (y: AVLNode): AVLNode => {
      const x = y.left!; // pivot — the node that rises
      const mid = x.right; // middle subtree that must be transferred
      
      push({
        type: "SYSTEM_LOG",
        level: "WARN",
        message: `Identyfikacja węzłów: [parent]=${y.value} oraz jego LEWE dziecko [pivot]=${x.value}.`,
      });
      push({
        type: "SYSTEM_LOG",
        level: "WARN",
        message: `[pivot] ${x.value} WZNOSI SIĘ w górę — przejmuje miejsce węzła [parent] ${y.value}.`,
      });
      push({
        type: "SYSTEM_LOG",
        level: "WARN",
        message: `[parent] ${y.value} OPADA w dół — staje się PRAWYM dzieckiem węzła [pivot] ${x.value}.`,
      });
      push({
        type: "SYSTEM_LOG",
        level: "INFO",
        message: `Oryginalne PRAWE poddrzewo węzła [pivot] ${x.value}${mid ? ` (korzeń ${mid.value})` : ` (null)`} zostaje przeniesione i staje się NOWYM LEWYM dzieckiem węzła [parent] ${y.value}. (Wartości są > ${x.value} i < ${y.value}).`,
      });

      y.left = x.right;
      if (x.right) x.right.parent = y;
      x.parent = y.parent;
      if (!y.parent) root = x;
      else if (y === y.parent.right) y.parent.right = x;
      else y.parent.left = x;
      x.right = y;
      y.parent = x;
      updateHeight(y);
      updateHeight(x);

      push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: x.id, status: "rotate" }, false);
      push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: y.id, status: "rotate" });

      syncTree();
      
      push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: x.id, status: "default" }, false);
      push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: y.id, status: "default" }, false);
      
      push({
        type: "SYSTEM_LOG",
        level: "INFO",
        message: `Zaktualizowano balance factors dla ${y.value} i ${x.value}.`,
      });
      return x;
    };

    // Pre-create stable node identities
    values.forEach((v) => {
      if (!nodes.find((n) => n.label === String(v))) {
        nodes.push({ id: `n${nextId++}`, label: String(v), hidden: true });
      }
    });

    push({
      type: "SYSTEM_LOG",
      level: "INFO",
      message: "Rozpoczynam budowę drzewa AVL.",
    });

    const simInsert = (value: number) => {
      const data = nodes.find(
        (n) =>
          n.label === String(value) &&
          !events.find((e) => e.type === "GRAPH_NODE_ADD" && e.nodeId === n.id),
      );
      if (!data) return; // duplicate
      const targetId = data.id;

      push({
        type: "SYSTEM_LOG",
        level: "INFO",
        message: `── Wstawiam ${value} ──`,
      });
      const newNode = new AVLNode(value, targetId);
      push({ type: "GRAPH_NODE_ADD", nodeId: targetId });
      push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: targetId, status: "visited" });

      // ── BST descent to find parent ──
      let parent: AVLNode | null = null;
      let cur = root;
      while (cur) {
        parent = cur;
        push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: cur.id, status: "current" });
        if (value < cur.value) {
          push({
            type: "SYSTEM_LOG",
            level: "INFO",
            message: `${value} < ${cur.value} → w lewo`,
          });
          if (cur.left)
            push({
              type: "GRAPH_EDGE_HIGHLIGHT",
              edgeId: `e${cur.id}-${cur.left.id}`,
              accepted: true,
            });
          cur = cur.left;
        } else if (value > cur.value) {
          push({
            type: "SYSTEM_LOG",
            level: "INFO",
            message: `${value} > ${cur.value} → w prawo`,
          });
          if (cur.right)
            push({
              type: "GRAPH_EDGE_HIGHLIGHT",
              edgeId: `e${cur.id}-${cur.right.id}`,
              accepted: true,
            });
          cur = cur.right;
        } else return; // duplicate value
      }

      // Spawn at parent's position so it animates outward
      const parentPos = parent ? lastCoords.get(parent.id) : null;
      push({
        type: "GRAPH_NODE_MOVE",
        nodeId: targetId,
        x: parentPos ? parentPos.x : CENTER_X,
        y: parentPos ? parentPos.y + LEVEL_H : TOP_Y,
      });
      lastCoords.set(targetId, {
        x: parentPos ? parentPos.x : CENTER_X,
        y: parentPos ? parentPos.y + LEVEL_H : TOP_Y,
      });

      newNode.parent = parent;
      if (!parent) root = newNode;
      else if (value < parent.value) parent.left = newNode;
      else parent.right = newNode;

      syncTree(); // show the freshly linked leaf in place

      // ── Retrace upwards, update heights & rebalance ──
      let node: AVLNode | null = parent;
      while (node) {
        const above = node.parent; // capture before any rotation re-links
        updateHeight(node);
        const balance = getBalance(node);

        push({
          type: "SYSTEM_LOG",
          level: "INFO",
          message: `BF(${node.value}) = ${balance}`,
        });

        if (balance > 1 && getBalance(node.left) >= 0) {
          // Left-Left: left child rises above the parent (single swap)
          push({
            type: "SYSTEM_LOG",
            level: "WARN",
            message: `${node.value} przeciążony w lewo (BF=${balance}) — lewe dziecko wzniesie się ponad ${node.value}.`,
          });
          rightRotate(node);
        } else if (balance > 1) {
          // Left-Right (double swap): align first, then rise
          push({
            type: "SYSTEM_LOG",
            level: "WARN",
            message: `${node.value} przeciążony lewo-prawo (BF=${balance}) — dwie zamiany: najpierw na lewym dziecku, potem na ${node.value}.`,
          });
          leftRotate(node.left!); // step 1: convert to a straight left-left line
          rightRotate(node); // step 2: standard right swap
        } else if (balance < -1 && getBalance(node.right) <= 0) {
          // Right-Right: right child rises above the parent (single swap)
          push({
            type: "SYSTEM_LOG",
            level: "WARN",
            message: `${node.value} przeciążony w prawo (BF=${balance}) — prawe dziecko wzniesie się ponad ${node.value}.`,
          });
          leftRotate(node);
        } else if (balance < -1) {
          // Right-Left (double swap): align first, then rise
          push({
            type: "SYSTEM_LOG",
            level: "WARN",
            message: `${node.value} przeciążony prawo-lewo (BF=${balance}) — dwie zamiany: najpierw na prawym dziecku, potem na ${node.value}.`,
          });
          rightRotate(node.right!); // step 1: convert to a straight right-right line
          leftRotate(node); // step 2: standard left swap
        }

        node = above;
      }
    };

    values.forEach((v) => simInsert(v));

    // ── Final cleanup ──
    push({
      type: "SYSTEM_LOG",
      level: "INFO",
      message: "Budowa drzewa AVL zakończona.",
    });
    for (const e of edges) {
      push({ type: "GRAPH_EDGE_HIGHLIGHT", edgeId: e.id, status: "default" });
    }
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
      edges: edges.map((e) => ({ ...e, weight: 0 })),
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
