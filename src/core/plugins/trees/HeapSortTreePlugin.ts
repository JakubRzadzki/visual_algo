/**
 * @file HeapSortTreePlugin.ts
 * @description Heap Sort visualised as a shrinking binary tree.
 *
 * Nodes (`p0` = root, `p1`, `p2`, …) represent heap positions. Values swap
 * between positions during heapify, and once the maximum bubbles to the root it
 * is swapped to the last leaf and that node is **removed** from the tree — so the
 * tree literally shrinks as the array is sorted. The NativeGraphStage shows the
 * extracted values filling a live sorted array beneath the tree.
 */

import type {
  AlgorithmPlugin,
  ExecutionTrace,
  ArrayInput,
  GraphInput,
  VisualizationEvent,
  EventPayload,
} from "../../../types";

export class HeapSortTreePlugin implements AlgorithmPlugin<ArrayInput> {
  id = "heap-sort-tree";
  name = "Heap Sort (Tree View)";
  category = "tree" as const;

  execute(data: ArrayInput): ExecutionTrace {
    // Work on a local copy — never mutate data.values.
    const heap =
      data.values && data.values.length > 0
        ? [...data.values]
        : [4, 10, 3, 5, 1, 6, 2, 8, 7, 9];

    const n = heap.length;
    const events: VisualizationEvent[] = [];
    let step = 0;
    const startTime = performance.now();

    const push = (evt: EventPayload) => {
      events.push({
        ...evt,
        id: crypto.randomUUID(),
        timestamp: performance.now(),
        step: step++,
      } as VisualizationEvent);
    };

    const log = (message: string, level: "INFO" | "WARN" = "INFO") =>
      push({ type: "SYSTEM_LOG", level, message });

    const highlight = (i: number, status: string) =>
      push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: `p${i}`, status });

    /** Swap two heap slots and emit a single animated swap event. */
    const swapNodes = (i: number, j: number) => {
      const tmp = heap[i];
      heap[i] = heap[j];
      heap[j] = tmp;
      push({ type: "GRAPH_NODE_SWAP", aId: `p${i}`, bId: `p${j}` });
    };

    /** Sift the value at index `i` down within a heap of size `heapSize`. */
    const siftDown = (heapSize: number, i: number) => {
      log(`sift-down z pozycji ${i} (wartość ${heap[i]})`);
      highlight(i, "current");

      const left = 2 * i + 1;
      const right = 2 * i + 2;
      let largest = i;

      const children: number[] = [];
      if (left < heapSize) children.push(left);
      if (right < heapSize) children.push(right);

      for (const c of children) {
        highlight(c, "queued");
        log(`Porównuję ${heap[i]} z ${heap[c]}`);
      }

      if (left < heapSize && heap[left] > heap[largest]) largest = left;
      if (right < heapSize && heap[right] > heap[largest]) largest = right;

      if (largest !== i) {
        log(`Zamieniam ${heap[i]} ↔ ${heap[largest]}`, "WARN");
        swapNodes(i, largest);
        highlight(i, "default");
        highlight(largest, "default");
        for (const c of children) if (c !== largest) highlight(c, "default");

        siftDown(heapSize, largest);
      } else {
        highlight(i, "default");
        for (const c of children) highlight(c, "default");
      }
    };

    // ── Fixed tree layout: every node hidden initially (dynNodes starts empty) ─
    const initialGraph: GraphInput = {
      nodes: heap.map((v, i) => ({
        id: `p${i}`,
        label: String(v),
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        hidden: true,
      })),
      edges: heap.slice(1).map((_, idx) => {
        const i = idx + 1;
        const parent = Math.floor((i - 1) / 2);
        return {
          id: `e${parent}-${i}`,
          from: `p${parent}`,
          to: `p${i}`,
          weight: 0,
          hidden: true,
        };
      }),
      isDirected: true,
      layoutHint: "dagre",
    };

    // ═══ FAZA 0 — pokaż całe drzewo ═══════════════════════════════════════════
    log(`Heap Sort (drzewo) — ${n} elementów`);
    log("Faza 1: Budowanie kopca maksymalnego (bottom-up heapify)");

    for (let i = 0; i < n; i++) {
      push({ type: "GRAPH_NODE_ADD", nodeId: `p${i}`, label: String(heap[i]) });
    }
    for (let i = 1; i < n; i++) {
      const parent = Math.floor((i - 1) / 2);
      push({
        type: "GRAPH_EDGE_ADD",
        edgeId: `e${parent}-${i}`,
        from: `p${parent}`,
        to: `p${i}`,
      });
    }

    // ═══ FAZA 1 — budowanie kopca (bottom-up sift-down) ═══════════════════════
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      siftDown(n, i);
    }

    // ═══ FAZA 2 — wyodrębnianie (drzewo się kurczy) ═══════════════════════════
    log(`Faza 2: Wyodrębnianie — ${n - 1} iteracji`);

    for (let i = n - 1; i >= 1; i--) {
      // Zaznacz korzeń (maksimum) oraz ostatni aktywny liść.
      highlight(0, "current");
      highlight(i, "queued");

      const max = heap[0];
      log(`Wyciągam max=${max}, zamieniam z ${heap[i]} na pozycji ${i}`, "WARN");

      // Zamiana wartości: max ląduje na pozycji i, liść trafia do korzenia.
      swapNodes(0, i);

      // Krótki akord "wyciągnięty", po czym usuwamy węzeł z drzewa.
      highlight(i, "finished");
      log(`Usuwam węzeł p${i} (${max}) z drzewa`);

      const parent = Math.floor((i - 1) / 2);
      push({ type: "GRAPH_EDGE_REMOVE", edgeId: `e${parent}-${i}` });
      push({ type: "GRAPH_NODE_REMOVE", nodeId: `p${i}` });

      // Napraw kopiec rozmiaru i (bez wyciągniętego elementu).
      highlight(0, "default");
      siftDown(i, 0);
    }

    // Zostaje tylko korzeń — najmniejszy element.
    highlight(0, "finished");
    log(`Posortowano. Korzeń p0=${heap[0]} to minimum.`);

    const endTime = performance.now();

    return {
      events,
      metadata: {
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(1)",
        executionTimeMs: endTime - startTime,
        nodeCount: n,
        algorithmName: this.name,
        initialGraph,
      },
    };
  }
}
