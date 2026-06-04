import type {
  AlgorithmPlugin,
  ExecutionTrace,
  ArrayInput,
  GraphInput,
  VisualizationEvent,
  EventPayload,
} from "../../../types";

/**
 * RBTPlugin — builds a Red-Black Tree and emits a visualization trace of the
 * insert + fix-up (recolor / rotate) process.
 *
 * Like {@link AVLTreePlugin}, edges are reconciled against the real tree
 * structure after every structural change ({@link syncTree}), so rotations
 * always rewire the parent edge correctly and the rendered tree never desyncs.
 *
 * Fix-up follows the three canonical cases:
 * - Case 1: Uncle is RED  → recolor parent, uncle, grandparent
 * - Case 2: Uncle is BLACK, node is inner child → rotate to align
 * - Case 3: Uncle is BLACK, node is outer child → recolor + rotate
 */
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

    const push = (evt: EventPayload, incrementStep: boolean = true) => {
      events.push({
        ...evt,
        id: crypto.randomUUID(),
        timestamp: performance.now(),
        step: step,
      });
      if (incrementStep) step++;
    };

    // ── RBT Node ──────────────────────────────────────────────────────────

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
    const edges: { id: string; from: string; to: string; hidden: boolean }[] =
      [];

    // ── Positional layout: root centered, children offset, spacing halves ──
    // (NOT in-order indexed — so rotations physically swap node positions.)

    const CENTER_X = 400;
    const TOP_Y = 70;
    const LEVEL_H = 92;
    const ROOT_SPREAD = 180;

    const lastCoords = new Map<string, { x: number; y: number }>();
    const updateLayout = (simRoot: RBTNode | null) => {
      const place = (
        n: RBTNode | null,
        x: number,
        y: number,
        spread: number,
      ) => {
        if (!n) return;
        const old = lastCoords.get(n.id);
        if (!old || old.x !== x || old.y !== y) {
          push({ type: "GRAPH_NODE_MOVE", nodeId: n.id, x, y }, false);
          lastCoords.set(n.id, { x, y });
        }
        place(n.left, x - spread, y + LEVEL_H, spread * 0.5);
        place(n.right, x + spread, y + LEVEL_H, spread * 0.5);
      };
      place(simRoot, CENTER_X, TOP_Y, ROOT_SPREAD);
    };

    // ── Edge reconciliation against the actual tree structure ──

    const activeEdges = new Set<string>();
    const reconcileEdges = (simRoot: RBTNode | null) => {
      const desired = new Map<string, { from: string; to: string }>();
      const walk = (n: RBTNode | null) => {
        if (!n) return;
        if (n.left) {
          desired.set(`e${n.id}-${n.left.id}`, { from: n.id, to: n.left.id });
          walk(n.left);
        }
        if (n.right) {
          desired.set(`e${n.id}-${n.right.id}`, {
            from: n.id,
            to: n.right.id,
          });
          walk(n.right);
        }
      };
      walk(simRoot);

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

    /** Re-sync edges + node positions to the current tree atomically. */
    const syncTree = () => {
      const oldStep = step;
      reconcileEdges(root);
      updateLayout(root);
      step = oldStep + 1;
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
      message: "Rozpoczynam budowę drzewa czerwono-czarnego.",
    });

    // ── Rotations ─────────────────────────────────────────────────────────

    /** LEFT rotation on [x]: its RIGHT child [y] rises, [x] falls. */
    const simLeftRotate = (x: RBTNode) => {
      const y = x.right!; // pivot — the node that rises
      const mid = y.left; // middle subtree to transfer
      const originalColor = x.color; // for color transfer
      
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
        message: `Oryginalne LEWE poddrzewo węzła [pivot] ${y.value}${mid ? ` (korzeń ${mid.value})` : ` (null)`} zostaje przeniesione i staje się NOWYM PRAWYM dzieckiem węzła [parent] ${x.value}.`,
      });

      x.right = y.left;
      if (y.left) y.left.parent = x;
      y.parent = x.parent;
      if (!x.parent) root = y;
      else if (x === x.parent.left) x.parent.left = y;
      else x.parent.right = y;
      y.left = x;
      x.parent = y;
      
      push({
        type: "SYSTEM_LOG",
        level: "INFO",
        message: `TRANSFER KOLORÓW: [pivot] ${y.value} dziedziczy oryginalny kolor po [parent] (${originalColor === "red" ? "CZERWONY" : "CZARNY"}), a [parent] ${x.value} staje się CZERWONY.`,
      });
      
      y.color = originalColor;
      x.color = "red";
      
      push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: x.id, status: "rotate" }, false);
      push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: y.id, status: "rotate" });

      syncTree();

      push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: y.id, status: y.color }, false);
      push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: x.id, status: x.color }, false);
    };

    /** RIGHT rotation on [y]: its LEFT child [x] rises, [y] falls. */
    const simRightRotate = (y: RBTNode) => {
      const x = y.left!; // pivot — the node that rises
      const mid = x.right; // middle subtree to transfer
      const originalColor = y.color; // for color transfer

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
        message: `Oryginalne PRAWE poddrzewo węzła [pivot] ${x.value}${mid ? ` (korzeń ${mid.value})` : ` (null)`} zostaje przeniesione i staje się NOWYM LEWYM dzieckiem węzła [parent] ${y.value}.`,
      });

      y.left = x.right;
      if (x.right) x.right.parent = y;
      x.parent = y.parent;
      if (!y.parent) root = x;
      else if (y === y.parent.right) y.parent.right = x;
      else y.parent.left = x;
      x.right = y;
      y.parent = x;
      
      push({
        type: "SYSTEM_LOG",
        level: "INFO",
        message: `TRANSFER KOLORÓW: [pivot] ${x.value} dziedziczy oryginalny kolor po [parent] (${originalColor === "red" ? "CZERWONY" : "CZARNY"}), a [parent] ${y.value} staje się CZERWONY.`,
      });
      
      x.color = originalColor;
      y.color = "red";
      
      push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: x.id, status: "rotate" }, false);
      push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: y.id, status: "rotate" });

      syncTree();

      push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: x.id, status: x.color }, false);
      push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: y.id, status: y.color }, false);
    };

    // ── Fix-up after insertion ────────────────────────────────────────────

    const simFixInsert = (node: RBTNode) => {
      while (node.parent && node.parent.color === "red") {
        const grandparent = node.parent.parent!;

        if (node.parent === grandparent.left) {
          // Parent is LEFT child of grandparent
          const uncle = grandparent.right;

          if (uncle && uncle.color === "red") {
            // ── Case 1: Uncle is RED → recolor ──
            push({
              type: "SYSTEM_LOG",
              level: "WARN",
              message: `Przypadek 1: wujek ${uncle.value} CZERWONY → rodzic i wujek na CZARNO, dziadek na CZERWONO (równa czarna wysokość), przenoszę problem w górę.`,
            });

            // Highlight uncle
            push({
              type: "GRAPH_NODE_HIGHLIGHT",
              nodeId: uncle.id,
              status: "current",
            });

            node.parent.color = "black";
            push({
              type: "GRAPH_NODE_HIGHLIGHT",
              nodeId: node.parent.id,
              status: "black",
            });

            uncle.color = "black";
            push({
              type: "GRAPH_NODE_HIGHLIGHT",
              nodeId: uncle.id,
              status: "black",
            });

            grandparent.color = "red";
            push({
              type: "GRAPH_NODE_HIGHLIGHT",
              nodeId: grandparent.id,
              status: "red",
            });

            // Move up — grandparent becomes the new "problem node"
            node = grandparent;
          } else {
            // Uncle is BLACK (or null)
            if (node === node.parent.right) {
              // ── Case 2: node is inner child → rotate to align ──
              push({
                type: "SYSTEM_LOG",
                level: "WARN",
                message: `Przypadek 2: ${node.value} to wewnętrzny wnuk (trójkąt) → zamiana na ${node.parent.value}, aby ułożyć węzły w linię.`,
              });
              node = node.parent;
              simLeftRotate(node);
            }

            // ── Case 3: node is outer child → recolor + rotate ──
            push({
              type: "SYSTEM_LOG",
              level: "WARN",
              message: `Przypadek 3: wujek jest CZARNY, węzeł to zewn. wnuk (linia LL/RR) → wykonujemy pojedynczą rotację i transfer kolorów (rotacja zrobi to automatycznie).`,
            });
            simRightRotate(node.parent!.parent!);
          }
        } else {
          // ── Mirror: parent is RIGHT child of grandparent ──
          const uncle = grandparent.left;

          if (uncle && uncle.color === "red") {
            // ── Case 1 (mirror): Uncle is RED → recolor ──
            push({
              type: "SYSTEM_LOG",
              level: "WARN",
              message: `Przypadek 1 (lustro): wujek ${uncle.value} CZERWONY → rodzic i wujek na CZARNO, dziadek na CZERWONO (równa czarna wysokość), przenoszę problem w górę.`,
            });

            push({
              type: "GRAPH_NODE_HIGHLIGHT",
              nodeId: uncle.id,
              status: "current",
            });

            node.parent.color = "black";
            push({
              type: "GRAPH_NODE_HIGHLIGHT",
              nodeId: node.parent.id,
              status: "black",
            });

            uncle.color = "black";
            push({
              type: "GRAPH_NODE_HIGHLIGHT",
              nodeId: uncle.id,
              status: "black",
            });

            grandparent.color = "red";
            push({
              type: "GRAPH_NODE_HIGHLIGHT",
              nodeId: grandparent.id,
              status: "red",
            });

            node = grandparent;
          } else {
            if (node === node.parent.left) {
              // ── Case 2 (mirror): inner child → rotate to align ──
              push({
                type: "SYSTEM_LOG",
                level: "WARN",
                message: `Przypadek 2 (lustro): ${node.value} to wewnętrzny wnuk (trójkąt) → zamiana na ${node.parent.value}, aby ułożyć węzły w linię.`,
              });
              node = node.parent;
              simRightRotate(node);
            }

            // ── Case 3 (mirror): recolor + rotate ──
            push({
              type: "SYSTEM_LOG",
              level: "WARN",
              message: `Przypadek 3 (lustro): wujek jest CZARNY, węzeł to zewn. wnuk (linia LL/RR) → wykonujemy pojedynczą rotację i transfer kolorów (rotacja zrobi to automatycznie).`,
            });
            simLeftRotate(node.parent!.parent!);
          }
        }
      }

      // Root is always black
      root!.color = "black";
      push({
        type: "GRAPH_NODE_HIGHLIGHT",
        nodeId: root!.id,
        status: "black",
      });
    };

    // ── Insert ────────────────────────────────────────────────────────────

    const simInsert = (value: number) => {
      const targetNodeData = nodes.find(
        (n) =>
          n.label === String(value) &&
          !events.find(
            (e) => e.type === "GRAPH_NODE_ADD" && (e as any).nodeId === n.id,
          ),
      );
      if (!targetNodeData) return;
      const targetId = targetNodeData.id;

      push({
        type: "SYSTEM_LOG",
        level: "INFO",
        message: `── Wstawiam ${value} ──`,
      });
      const newNode = new RBTNode(value, targetId);
      push({ type: "GRAPH_NODE_ADD", nodeId: targetId });
      push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: targetId, status: "red" });

      // BST descent to find the correct parent
      let parent: RBTNode | null = null;
      let curr = root;
      while (curr) {
        parent = curr;
        push({
          type: "GRAPH_NODE_HIGHLIGHT",
          nodeId: curr.id,
          status: "current",
        });
        if (value < curr.value) {
          push({
            type: "SYSTEM_LOG",
            level: "INFO",
            message: `${value} < ${curr.value} → idę w lewo`,
          });
          if (curr.left)
            push({
              type: "GRAPH_EDGE_HIGHLIGHT",
              edgeId: `e${curr.id}-${curr.left.id}`,
              accepted: true,
            });
          curr = curr.left;
        } else {
          push({
            type: "SYSTEM_LOG",
            level: "INFO",
            message: `${value} > ${curr.value} → idę w prawo`,
          });
          if (curr.right)
            push({
              type: "GRAPH_EDGE_HIGHLIGHT",
              edgeId: `e${curr.id}-${curr.right.id}`,
              accepted: true,
            });
          curr = curr.right;
        }

        // Restore node's original color before moving on
        push({
          type: "GRAPH_NODE_HIGHLIGHT",
          nodeId: parent.id,
          status: parent.color,
        });
      }

      // Spawn at parent's position so the node animates outward
      const parentPos = parent ? lastCoords.get(parent.id) : null;
      const startX = parentPos ? parentPos.x : 400;
      const startY = parentPos ? parentPos.y : 80;
      push({
        type: "GRAPH_NODE_MOVE",
        nodeId: targetId,
        x: startX,
        y: startY,
      });
      lastCoords.set(targetId, { x: startX, y: startY });

      newNode.parent = parent;
      if (!parent) {
        root = newNode;
      } else if (value < parent.value) {
        parent.left = newNode;
      } else {
        parent.right = newNode;
      }

      // Reconcile edges + layout after BST insert, then run fix-up
      syncTree();

      push({
        type: "SYSTEM_LOG",
        level: "INFO",
        message: `Węzeł ${value} wstawiony jako CZERWONY → sprawdzam właściwości RBT`,
      });

      simFixInsert(newNode);
    };

    // ── Main loop ─────────────────────────────────────────────────────────

    values.forEach((v) => simInsert(v));

    // ── Final cleanup ─────────────────────────────────────────────────────

    push({
      type: "SYSTEM_LOG",
      level: "INFO",
      message: "Budowa drzewa czerwono-czarnego zakończona.",
    });

    for (const e of edges) {
      push({ type: "GRAPH_EDGE_HIGHLIGHT", edgeId: e.id, status: "default" });
    }

    // Set final node colors
    const setFinalColors = (n: RBTNode | null) => {
      if (!n) return;
      push({
        type: "GRAPH_NODE_HIGHLIGHT",
        nodeId: n.id,
        status: n.color === "red" ? "red" : "black",
      });
      setFinalColors(n.left);
      setFinalColors(n.right);
    };
    setFinalColors(root);

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
