import type { AlgorithmPlugin, ExecutionTrace, EventPayload, VisualizationEvent } from '../../../types';

export class HeapSortPlugin implements AlgorithmPlugin<number[]> {
  id = 'heap-sort';
  name = 'Heap Sort';
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
      } as VisualizationEvent);
    };

    const n = arr.length;

    /**
     * Sift down the element at index i to maintain the max-heap property
     * within the sub-array arr[0..heapSize-1].
     */
    const heapify = (heapSize: number, i: number) => {
      let largest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;

      if (left < heapSize) {
        pushEvent({ type: 'ARRAY_COMPARE', indices: [left, largest] });
        if (arr[left] > arr[largest]) {
          largest = left;
        }
      }

      if (right < heapSize) {
        pushEvent({ type: 'ARRAY_COMPARE', indices: [right, largest] });
        if (arr[right] > arr[largest]) {
          largest = right;
        }
      }

      // If the largest element is not the root, swap and recurse
      if (largest !== i) {
        const temp = arr[i];
        arr[i] = arr[largest];
        arr[largest] = temp;
        pushEvent({ type: 'ARRAY_SWAP', indices: [i, largest], values: [arr[i], arr[largest]] });
        heapify(heapSize, largest);
      }
    };

    // Build a max-heap from the unordered array (bottom-up)
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      heapify(n, i);
    }

    // Extract elements from heap one by one
    for (let i = n - 1; i > 0; i--) {
      // Move current root (max) to the end
      const temp = arr[0];
      arr[0] = arr[i];
      arr[i] = temp;
      pushEvent({ type: 'ARRAY_SWAP', indices: [0, i], values: [arr[0], arr[i]] });

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
        initialState: [...data]
      }
    };
  }
}
