/**
 * @file LinearSearchPlugin.ts
 * @description Plugin for the Linear Search algorithm.
 *
 * Scans elements sequentially to find a target value.
 * Time complexity: O(n), Space complexity: O(1).
 */

import type {
  AlgorithmPlugin,
  ExecutionTrace,
  EventPayload,
  VisualizationEvent,
  ArrayInput,
} from "../../../types";

/**
 * LinearSearchPlugin — Implements the Linear Search algorithm.
 */
export class LinearSearchPlugin implements AlgorithmPlugin<
  ArrayInput & { target?: number }
> {
  id = "linear-search";
  name = "Linear Search";
  category = "searching" as const;

  /**
   * Executes the Linear Search algorithm.
   *
   * @param input - The input data containing the array and an optional target.
   * @returns An ExecutionTrace with search check and result events.
   */
  execute(input: ArrayInput & { target?: number }): ExecutionTrace {
    const arr = [...input.values];
    // If target is not provided, default to the last element
    const target =
      input.target !== undefined ? input.target : arr[arr.length - 1];

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

    let found = false;

    // Phase: Sequential scan of the array
    for (let i = 0; i < arr.length; i++) {
      // Record comparison check
      pushEvent({ type: "SEARCH_CHECK", index: i, value: arr[i], target });

      if (arr[i] === target) {
        // Target found
        pushEvent({ type: "SEARCH_FOUND", index: i, value: arr[i] });
        found = true;
        break;
      }
    }

    // Record failure if not found
    if (!found) {
      pushEvent({ type: "SEARCH_NOT_FOUND", target });
    }

    const endTime = performance.now();

    return {
      events,
      metadata: {
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        executionTimeMs: endTime - startTime,
        nodeCount: arr.length,
        algorithmName: this.name,
        initialState: [...input.values],
      },
    };
  }
}
