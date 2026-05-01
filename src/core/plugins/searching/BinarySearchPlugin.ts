import type { AlgorithmPlugin, ExecutionTrace, EventPayload, VisualizationEvent } from '../../../types';

export class BinarySearchPlugin implements AlgorithmPlugin<number[]> {
  id = 'binary-search';
  name = 'Binary Search';
  category = 'searching' as const;

  /**
   * Executes binary search on a sorted array, searching for the last element
   * as the target (for demonstration). Emits SEARCH_NARROW, SEARCH_CHECK,
   * and final SEARCH_FOUND / SEARCH_NOT_FOUND events.
   */
  execute(data: number[]): ExecutionTrace {
    // Sort input to guarantee binary search precondition
    const arr = [...data].sort((a, b) => a - b);
    const target = arr[arr.length - 1]; // search for the largest element
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

    let left = 0;
    let right = arr.length - 1;
    let found = false;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);

      // Show current search window
      pushEvent({ type: 'SEARCH_NARROW', left, right, mid });

      // Check the middle element
      pushEvent({ type: 'SEARCH_CHECK', index: mid, value: arr[mid], target });

      if (arr[mid] === target) {
        pushEvent({ type: 'SEARCH_FOUND', index: mid, value: arr[mid] });
        found = true;
        break;
      } else if (arr[mid] < target) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    if (!found) {
      pushEvent({ type: 'SEARCH_NOT_FOUND', target });
    }

    const endTime = performance.now();

    pushEvent({
      type: 'SYSTEM_LOG',
      level: 'INFO',
      message: found
        ? `Binary Search: found ${target} in ${step} steps.`
        : `Binary Search: ${target} not found after ${step} steps.`
    });

    return {
      events,
      metadata: {
        timeComplexity: 'O(log n)',
        spaceComplexity: 'O(1)',
        executionTimeMs: endTime - startTime,
        nodeCount: arr.length,
        algorithmName: this.name,
        initialState: arr
      }
    };
  }
}
