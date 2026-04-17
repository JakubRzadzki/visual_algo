import { AlgorithmPlugin, ExecutionTrace, VisualizationEvent } from '../../../types';

export class MergeSortPlugin implements AlgorithmPlugin<number[]> {
  id = 'merge-sort';
  name = 'Merge Sort';
  category = 'sorting' as const;

  execute(data: number[]): ExecutionTrace {
    const arr = [...data];
    const events: VisualizationEvent[] = [];
    let step = 0;
    const startTime = performance.now();

    const pushEvent = (event: Omit<VisualizationEvent, 'id' | 'timestamp' | 'step'>) => {
      events.push({
        ...event,
        id: crypto.randomUUID(),
        timestamp: performance.now(),
        step: step++
      } as VisualizationEvent);
    };

    const merge = (start: number, mid: number, end: number) => {
      let leftIndex = start;
      let rightIndex = mid + 1;
      const temp: number[] = [];

      while (leftIndex <= mid && rightIndex <= end) {
        pushEvent({ type: 'ARRAY_COMPARE', indices: [leftIndex, rightIndex] });
        if (arr[leftIndex] <= arr[rightIndex]) {
          temp.push(arr[leftIndex++]);
        } else {
          temp.push(arr[rightIndex++]);
        }
      }

      while (leftIndex <= mid) {
        temp.push(arr[leftIndex++]);
      }

      while (rightIndex <= end) {
        temp.push(arr[rightIndex++]);
      }

      for (let i = start; i <= end; i++) {
        arr[i] = temp[i - start];
        pushEvent({ type: 'ARRAY_SET', index: i, value: arr[i] });
      }
    };

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
        algorithmName: this.name
      }
    };
  }
}
