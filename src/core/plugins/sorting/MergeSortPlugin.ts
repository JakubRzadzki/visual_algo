/**
 * @file MergeSortPlugin.ts
 * @description Plugin for the Merge Sort algorithm.
 * 
 * Implements a divide-and-conquer approach with O(n log n) time complexity.
 * Emits comparison and set events for visualization.
 */

import type { AlgorithmPlugin, ExecutionTrace, EventPayload, VisualizationEvent, ArrayInput } from '../../../types';

/**
 * MergeSortPlugin — Implements the Merge Sort algorithm.
 */
export class MergeSortPlugin implements AlgorithmPlugin<ArrayInput> {
  id = 'merge-sort';
  name = 'Merge Sort';
  category = 'sorting' as const;

  /**
   * Executes the Merge Sort algorithm on the input array.
   * 
   * @param input - The input data containing the array values.
   * @returns An ExecutionTrace with comparison and set events.
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
     * Merges two sorted subarrays into one.
     * 
     * @param start - Start index of the first subarray.
     * @param mid - End index of the first subarray.
     * @param end - End index of the second subarray.
     */
    const merge = (start: number, mid: number, end: number) => {
      let leftIndex = start;
      let rightIndex = mid + 1;
      const temp: number[] = [];

      // Phase: Merging two sorted halves
      while (leftIndex <= mid && rightIndex <= end) {
        pushEvent({ type: 'ARRAY_COMPARE', indices: [leftIndex, rightIndex] });
        if (arr[leftIndex] <= arr[rightIndex]) {
          temp.push(arr[leftIndex++]);
        } else {
          temp.push(arr[rightIndex++]);
        }
      }

      // Phase: Copying remaining elements from left half
      while (leftIndex <= mid) {
        temp.push(arr[leftIndex++]);
      }

      // Phase: Copying remaining elements from right half
      while (rightIndex <= end) {
        temp.push(arr[rightIndex++]);
      }

      // Phase: Writing merged results back to original array
      for (let i = start; i <= end; i++) {
        const previousValue = arr[i];
        arr[i] = temp[i - start];
        pushEvent({ type: 'ARRAY_SET', index: i, value: arr[i], previousValue });
      }
    };

    /**
     * Recursively divides the array.
     * 
     * @param start - Start index of current range.
     * @param end - End index of current range.
     */
    const mergeSort = (start: number, end: number) => {
      if (start >= end) return;
      
      const mid = Math.floor((start + end) / 2);
      
      mergeSort(start, mid);
      mergeSort(mid + 1, end);
      merge(start, mid, end);
    };

    mergeSort(0, arr.length - 1);

    const endTime = performance.now();

    return {
      events,
      metadata: {
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(n)',
        executionTimeMs: endTime - startTime,
        nodeCount: arr.length,
        algorithmName: this.name,
        initialState: [...input.values]
      }
    };
  }
}
