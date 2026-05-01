import type { AlgorithmPlugin, ExecutionTrace, EventPayload, VisualizationEvent } from '../../../types';

export class BubbleSortPlugin implements AlgorithmPlugin<number[]> {
  id = 'bubble-sort';
  name = 'Bubble Sort';
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

    // Classic Bubble Sort with early-exit optimization
    for (let i = 0; i < n - 1; i++) {
      let swapped = false;

      for (let j = 0; j < n - i - 1; j++) {
        // Compare adjacent elements
        pushEvent({ type: 'ARRAY_COMPARE', indices: [j, j + 1] });

        if (arr[j] > arr[j + 1]) {
          // Swap if they are in the wrong order
          const temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
          pushEvent({ type: 'ARRAY_SWAP', indices: [j, j + 1], values: [arr[j], arr[j + 1]] });
          swapped = true;
        }
      }

      // If no swaps occurred in this pass, the array is already sorted
      if (!swapped) break;
    }

    const endTime = performance.now();

    return {
      events,
      metadata: {
        timeComplexity: 'O(n²)',
        spaceComplexity: 'O(1)',
        executionTimeMs: endTime - startTime,
        nodeCount: arr.length,
        algorithmName: this.name,
        initialState: [...data]
      }
    };
  }
}
