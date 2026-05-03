/**
 * @file QuickSortPlugin.ts
 * @description Plugin for the Quick Sort algorithm.
 * 
 * Implements a divide-and-conquer approach using a pivot element.
 * Average time complexity O(n log n), worst case O(n²).
 */

import type { AlgorithmPlugin, ExecutionTrace, EventPayload, VisualizationEvent, ArrayInput } from '../../../types';

/**
 * QuickSortPlugin — Implements the Quick Sort algorithm.
 */
export class QuickSortPlugin implements AlgorithmPlugin<ArrayInput> {
  id = 'quick-sort';
  name = 'Quick Sort';
  category = 'sorting' as const;

  /**
   * Executes the Quick Sort algorithm on the input array.
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

    /**
     * Swaps two elements and records the event.
     * 
     * @param i - First index.
     * @param j - Second index.
     */
    const swap = (i: number, j: number) => {
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
      pushEvent({ 
        type: 'ARRAY_SWAP', 
        indices: [i, j], 
        values: [arr[i], arr[j]] 
      });
    };

    /**
     * Lomuto partition scheme.
     * 
     * @param low - Lower bound.
     * @param high - Higher bound (pivot).
     * @returns The partition index.
     */
    const partition = (low: number, high: number): number => {
      const pivot = arr[high];
      let i = low - 1;

      // Phase: Iterating and comparing elements against pivot
      for (let j = low; j < high; j++) {
        pushEvent({ type: 'ARRAY_COMPARE', indices: [j, high] });
        
        if (arr[j] < pivot) {
          i++;
          if (i !== j) {
            swap(i, j);
          }
        }
      }
      
      // Phase: Placing pivot in correct position
      if (i + 1 !== high) {
        swap(i + 1, high);
      }
      return i + 1;
    };

    /**
     * Recursive Quick Sort function.
     * 
     * @param low - Lower bound.
     * @param high - Higher bound.
     */
    const quickSort = (low: number, high: number) => {
      if (low < high) {
        const pi = partition(low, high);
        quickSort(low, pi - 1);
        quickSort(pi + 1, high);
      }
    };

    quickSort(0, arr.length - 1);

    const endTime = performance.now();

    return {
      events,
      metadata: {
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(log n)',
        executionTimeMs: endTime - startTime,
        nodeCount: arr.length,
        algorithmName: this.name,
        initialState: [...input.values]
      }
    };
  }
}
