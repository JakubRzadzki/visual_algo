import type { AlgorithmPlugin, ExecutionTrace, EventPayload, VisualizationEvent } from '../../../types';

export class QuickSortPlugin implements AlgorithmPlugin<number[]> {
  id = 'quick-sort';
  name = 'Quick Sort';
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
        timestamp: performance.now(),
        step: step++
      } as any);
    };

    // Helper function to swap two elements in the array and record the event
    const swap = (i: number, j: number) => {
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
      pushEvent({ type: 'ARRAY_SWAP', indices: [i, j], values: [arr[i], arr[j]] });
    };

    // Partitions the array around a pivot element (Lomuto partition scheme)
    const partition = (low: number, high: number): number => {
      const pivot = arr[high]; // Choosing the last element as pivot
      let i = low - 1; // Index of smaller element

      for (let j = low; j < high; j++) {
        // Record the comparison against the pivot
        pushEvent({ type: 'ARRAY_COMPARE', indices: [j, high] });
        
        // If current element is smaller than the pivot
        if (arr[j] < pivot) {
          i++;
          // Only swap if indices are different to avoid redundant state updates
          if (i !== j) {
            swap(i, j);
          }
        }
      }
      // Place the pivot in its correct sorted position
      if (i + 1 !== high) {
        swap(i + 1, high);
      }
      return i + 1;
    };

    // Main recursive function to implement QuickSort
    const quickSort = (low: number, high: number) => {
      if (low < high) {
        // pi is the partitioning index, arr[pi] is now at right place
        const pi = partition(low, high);
        
        // Separately sort elements before and after partition
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
        algorithmName: this.name
      }
    };
  }
}
