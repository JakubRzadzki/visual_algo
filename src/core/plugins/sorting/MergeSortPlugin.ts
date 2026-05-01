import type { AlgorithmPlugin, ExecutionTrace, EventPayload, VisualizationEvent } from '../../../types';

export class MergeSortPlugin implements AlgorithmPlugin<number[]> {
  id = 'merge-sort';
  name = 'Merge Sort';
  category = 'sorting' as const;

  execute(data: number[]): ExecutionTrace {
    const arr = [...data];
    const events: VisualizationEvent[] = [];
    let step = 0;
    const startTime = performance.now();

    const pushEvent = (event: EventPayload) => {
      events.push({
        ...event,
        id: crypto.randomUUID(),
        step: step++
      } as VisualizationEvent);
    };

    // Merges two subarrays of arr[]
    // First subarray is arr[start..mid]
    // Second subarray is arr[mid+1..end]
    const merge = (start: number, mid: number, end: number) => {
      let leftIndex = start;
      let rightIndex = mid + 1;
      const temp: number[] = [];

      // Merge the temporary arrays back into arr[start..end]
      while (leftIndex <= mid && rightIndex <= end) {
        // Record the comparison between elements in the left and right halves
        pushEvent({ type: 'ARRAY_COMPARE', indices: [leftIndex, rightIndex] });
        if (arr[leftIndex] <= arr[rightIndex]) {
          temp.push(arr[leftIndex++]);
        } else {
          temp.push(arr[rightIndex++]);
        }
      }

      // Copy the remaining elements of the left half, if there are any
      while (leftIndex <= mid) {
        temp.push(arr[leftIndex++]);
      }

      // Copy the remaining elements of the right half, if there are any
      while (rightIndex <= end) {
        temp.push(arr[rightIndex++]);
      }

      // Update original array with the merged and sorted elements
      for (let i = start; i <= end; i++) {
        const previousValue = arr[i];
        arr[i] = temp[i - start];
        // Record the final placement of the element
        pushEvent({ type: 'ARRAY_SET', index: i, value: arr[i], previousValue });
      }
    };

    // Main recursive function that implements Merge Sort
    const mergeSort = (start: number, end: number) => {
      // Base case: arrays with 0 or 1 element are already sorted
      if (start >= end) return;
      
      const mid = Math.floor((start + end) / 2);
      
      // Recursively sort first and second halves
      mergeSort(start, mid);
      mergeSort(mid + 1, end);
      
      // Merge the sorted halves
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
        initialState: [...data]
      }
    };
  }
}
