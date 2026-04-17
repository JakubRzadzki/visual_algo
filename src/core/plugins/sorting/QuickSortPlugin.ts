import { AlgorithmPlugin, ExecutionTrace, VisualizationEvent } from '../../../types';

export class QuickSortPlugin implements AlgorithmPlugin<number[]> {
  id = 'quick-sort';
  name = 'Quick Sort';
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

    const swap = (i: number, j: number) => {
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
      pushEvent({ type: 'ARRAY_SWAP', indices: [i, j], values: [arr[i], arr[j]] });
    };

    const partition = (low: number, high: number): number => {
      const pivot = arr[high];
      let i = low - 1;

      for (let j = low; j < high; j++) {
        pushEvent({ type: 'ARRAY_COMPARE', indices: [j, high] });
        if (arr[j] < pivot) {
          i++;
          swap(i, j);
        }
      }
      swap(i + 1, high);
      return i + 1;
    };

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
        algorithmName: this.name
      }
    };
  }
}
