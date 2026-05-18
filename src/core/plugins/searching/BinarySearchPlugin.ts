/**
 * @file BinarySearchPlugin.ts
 * @description Plugin for the Binary Search algorithm.
 *
 * Efficiently finds a target in a sorted array by repeatedly halving the search space.
 * Time complexity: O(log n), Space complexity: O(1).
 */

import type {
  AlgorithmPlugin,
  ExecutionTrace,
  EventPayload,
  VisualizationEvent,
  ArrayInput,
} from "../../../types";

/**
 * BinarySearchPlugin — Implements the Binary Search algorithm.
 */
export class BinarySearchPlugin implements AlgorithmPlugin<
  ArrayInput & { target?: number }
> {
  id = "binary-search";
  name = "Binary Search";
  category = "searching" as const;

  /**
   * Executes the Binary Search algorithm.
   *
   * Assumes/ensures the input array is sorted before starting.
   *
   * @param input - The input data containing the array and an optional target.
   * @returns An ExecutionTrace with narrow, check, and result events.
   */
  execute(input: ArrayInput & { target?: number }): ExecutionTrace {
    // Binary search requires a sorted array
    const arr = [...input.values].sort((a, b) => a - b);

    // Default target to a value known to be in the array for demonstration
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

    let left = 0;
    let right = arr.length - 1;
    let found = false;

    // Phase: Logarithmic search by halving range
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);

      // Record the current search boundaries
      pushEvent({ type: "SEARCH_NARROW", left, right, mid });

      // Record comparison with the middle element
      pushEvent({ type: "SEARCH_CHECK", index: mid, value: arr[mid], target });

      if (arr[mid] === target) {
        // Target found
        pushEvent({ type: "SEARCH_FOUND", index: mid, value: arr[mid] });
        found = true;
        break;
      } else if (arr[mid] < target) {
        // Target is in the right half
        left = mid + 1;
      } else {
        // Target is in the left half
        right = mid - 1;
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
        timeComplexity: "O(log n)",
        spaceComplexity: "O(1)",
        executionTimeMs: endTime - startTime,
        nodeCount: arr.length,
        algorithmName: this.name,
        initialState: arr, // Using the sorted array as initial state for visualization
      },
    };
  }
}
