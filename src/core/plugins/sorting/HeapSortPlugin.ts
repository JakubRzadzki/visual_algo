/**
 * @file HeapSortPlugin.ts
 * @description Plugin for the Heap Sort algorithm.
 * 
 * Implements an in-place sort using a binary heap data structure.
 * Time complexity O(n log n), space complexity O(1).
 */

import type { AlgorithmPlugin, ExecutionTrace, EventPayload, VisualizationEvent, ArrayInput } from '../../../types';

/**
 * HeapSortPlugin — Implements the Heap Sort algorithm.
 */
export class HeapSortPlugin implements AlgorithmPlugin<ArrayInput> {
  id = 'heap-sort';
  name = 'Heap Sort';
  category = 'sorting' as const;

  /**
   * Executes the Heap Sort algorithm on the input array.
   * 
   * @param input - The input data containing the array values.
   * @returns An ExecutionTrace with comparison and swap events.
   */
  execute(input: ArrayInput): ExecutionTrace {
    const arr = [...input.values];
    const events: VisualizationEvent[] = [];
    let step = 0;
    const startTime = performance.now();

    const pushEvent = (event: EventPayload) => {
      events.push({
        ...event,
        id: crypto.randomUUID(),
        timestamp: performance.now(),
        step: step++
      } as VisualizationEvent);
    };

    const n = arr.length;

    /**
     * Sift-down operation to maintain max-heap property.
     * 
     * @param heapSize - Current size of the heap.
     * @param i - Root index of the subtree.
     */
    const heapify = (heapSize: number, i: number) => {
      let largest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;

      // Phase: Comparing root with left child
      if (left < heapSize) {
        pushEvent({ type: 'ARRAY_COMPARE', indices: [left, largest] });
        if (arr[left] > arr[largest]) {
          largest = left;
        }
      }

      // Phase: Comparing largest with right child
      if (right < heapSize) {
        pushEvent({ type: 'ARRAY_COMPARE', indices: [right, largest] });
        if (arr[right] > arr[largest]) {
          largest = right;
        }
      }

      // Phase: Swapping if root is not largest
      if (largest !== i) {
        const temp = arr[i];
        arr[i] = arr[largest];
        arr[largest] = temp;
        pushEvent({ 
          type: 'ARRAY_SWAP', 
          indices: [i, largest], 
          values: [arr[i], arr[largest]] 
        });
        heapify(heapSize, largest);
      }
    };

    // Phase 1: Build max-heap (bottom-up)
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      heapify(n, i);
    }

    // Phase 2: Extract elements from heap one by one
    for (let i = n - 1; i > 0; i--) {
      // Move current root (max) to the end
      const temp = arr[0];
      arr[0] = arr[i];
      arr[i] = temp;
      pushEvent({ 
        type: 'ARRAY_SWAP', 
        indices: [0, i], 
        values: [arr[0], arr[i]] 
      });

      // Heapify the reduced heap
      heapify(i, 0);
    }

    const endTime = performance.now();

    return {
      events,
      metadata: {
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(1)',
        executionTimeMs: endTime - startTime,
        nodeCount: arr.length,
        algorithmName: this.name,
        initialState: [...input.values]
      }
    };
  }
}
