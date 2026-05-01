import type { AlgorithmPlugin, ExecutionTrace, EventPayload, VisualizationEvent } from '../../../types';

export class LinearSearchPlugin implements AlgorithmPlugin<number[]> {
  id = 'linear-search';
  name = 'Linear Search';
  category = 'searching' as const;

  /**
   * Executes linear search, scanning every element sequentially.
   * Searches for the last element as the target (for demonstration).
   * Emits SEARCH_CHECK for each comparison and SEARCH_FOUND / SEARCH_NOT_FOUND.
   */
  execute(data: number[]): ExecutionTrace {
    const arr = [...data];
    const target = arr[arr.length - 1]; // search for the last element
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

    let found = false;

    for (let i = 0; i < arr.length; i++) {
      // Check every element one by one
      pushEvent({ type: 'SEARCH_CHECK', index: i, value: arr[i], target });

      if (arr[i] === target) {
        pushEvent({ type: 'SEARCH_FOUND', index: i, value: arr[i] });
        found = true;
        break;
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
        ? `Linear Search: found ${target} at index ${step - 2}.`
        : `Linear Search: ${target} not found after scanning ${arr.length} elements.`
    });

    return {
      events,
      metadata: {
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        executionTimeMs: endTime - startTime,
        nodeCount: arr.length,
        algorithmName: this.name,
        initialState: [...data]
      }
    };
  }
}
