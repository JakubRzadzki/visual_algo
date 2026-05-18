/**
 * @file BubbleSortPlugin.ts
 * @description Plugin for the Bubble Sort algorithm.
 *
 * Implements the classic sink-sort algorithm with O(n²) time complexity.
 * Emits comparison and swap events for visualization.
 */

import type {
  AlgorithmPlugin,
  ExecutionTrace,
  EventPayload,
  VisualizationEvent,
  ArrayInput,
} from "../../../types";

/**
 * BubbleSortPlugin — Implements the Bubble Sort algorithm.
 */
export class BubbleSortPlugin implements AlgorithmPlugin<ArrayInput> {
  id = "bubble-sort";
  name = "Bubble Sort";
  category = "sorting" as const;

  /**
   * Executes the Bubble Sort algorithm on the input array.
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
        step: step++,
      } as VisualizationEvent);
    };

    const n = arr.length;

    // Phase: Outer pass loop
    for (let i = 0; i < n - 1; i++) {
      let swapped = false;

      // Phase: Inner comparison loop
      for (let j = 0; j < n - i - 1; j++) {
        // Record comparison event
        pushEvent({ type: "ARRAY_COMPARE", indices: [j, j + 1] });

        if (arr[j] > arr[j + 1]) {
          // Perform swap logic
          const temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;

          // Record swap event
          pushEvent({
            type: "ARRAY_SWAP",
            indices: [j, j + 1],
            values: [arr[j], arr[j + 1]],
          });
          swapped = true;
        }
      }

      // Early exit if no swaps occurred (array already sorted)
      if (!swapped) break;
    }

    const endTime = performance.now();

    return {
      events,
      metadata: {
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
        executionTimeMs: endTime - startTime,
        nodeCount: arr.length,
        algorithmName: this.name,
        initialState: [...input.values],
      },
    };
  }
}
