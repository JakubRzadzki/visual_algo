/**
 * @file KnapsackDPPlugin.ts
 * @description Web Worker plugin implementing the 0/1 Knapsack Dynamic Programming algorithm.
 *
 * Implements AlgorithmPlugin<KnapsackInput> and emits discrete matrix cell update events
 * for every computed state table[i][w], detailing precisely which preceding subproblem
 * cells serve as dependencies.
 *
 * Time Complexity:  O(n * W)
 * Space Complexity: O(n * W)
 */

import type { 
  AlgorithmPlugin, 
  ExecutionTrace, 
  VisualizationEvent, 
  KnapsackInput, 
  KnapsackItem,
  EventPayload 
} from '../../../types';

/**
 * Default sample dataset used if input is absent or empty.
 */
const DEFAULT_ITEMS: KnapsackItem[] = [
  { weight: 1, value: 15 },
  { weight: 3, value: 20 },
  { weight: 4, value: 30 },
  { weight: 2, value: 10 }
];

const DEFAULT_CAPACITY = 6;

/**
 * KnapsackDPPlugin — Encapsulates the 0/1 Knapsack optimization problem visualization.
 */
export class KnapsackDPPlugin implements AlgorithmPlugin<KnapsackInput> {
  id = 'knapsack';
  name = '0/1 Knapsack';
  category = 'dp' as const;

  /**
   * Executes the 0/1 Knapsack algorithm and generates a complete execution trace.
   *
   * @param input - The input container with items and maximum weight capacity.
   * @returns An ExecutionTrace driving the matrix table view stage.
   */
  execute(input: KnapsackInput): ExecutionTrace {
    const items = input?.items?.length ? input.items : DEFAULT_ITEMS;
    const capacity = typeof input?.capacity === 'number' && input.capacity > 0 ? input.capacity : DEFAULT_CAPACITY;
    
    const events: VisualizationEvent[] = [];
    let step = 0;
    const startTime = performance.now();

    /** Helper to uniformly structure emitted events */
    const pushEvent = (payload: EventPayload) => {
      events.push({
        ...payload,
        id: crypto.randomUUID(),
        timestamp: performance.now(),
        step: step++
      } as VisualizationEvent);
    };

    const n = items.length;
    const dp: number[][] = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));

    // Phase 1: Emit initial setup log
    pushEvent({
      type: 'SYSTEM_LOG',
      message: `Initializing 0/1 Knapsack DP table with ${n} items and max capacity W = ${capacity}.`,
      level: 'INFO'
    });

    // Generate informative Row and Column Headers
    const rowHeaders = ['Base (0)', ...items.map((it, idx) => `Item ${idx + 1} (w:${it.weight}, v:${it.value})`)];
    const colHeaders = Array.from({ length: capacity + 1 }, (_, w) => `W=${w}`);

    // Phase 2: Compute DP table cell by cell
    for (let i = 0; i <= n; i++) {
      for (let w = 0; w <= capacity; w++) {
        if (i === 0 || w === 0) {
          // Base cases: 0 items or 0 capacity yield 0 value
          dp[i][w] = 0;
          pushEvent({
            type: 'MATRIX_CELL_UPDATE',
            row: i,
            col: w,
            value: 0,
            dependencies: []
          });
        } else {
          const currentItem = items[i - 1];
          
          if (currentItem.weight <= w) {
            // Option 1: Exclude the current item
            const valueExcluding = dp[i - 1][w];
            // Option 2: Include the current item
            const valueIncluding = dp[i - 1][w - currentItem.weight] + currentItem.value;

            if (valueIncluding > valueExcluding) {
              dp[i][w] = valueIncluding;
              pushEvent({
                type: 'MATRIX_CELL_UPDATE',
                row: i,
                col: w,
                value: dp[i][w],
                dependencies: [[i - 1, w], [i - 1, w - currentItem.weight]]
              });
              pushEvent({
                type: 'SYSTEM_LOG',
                message: `table[${i}][${w}] updated to ${dp[i][w]} by taking Item ${i} (value ${currentItem.value}) + subproblem table[${i-1}][${w - currentItem.weight}].`,
                level: 'INFO'
              });
            } else {
              dp[i][w] = valueExcluding;
              pushEvent({
                type: 'MATRIX_CELL_UPDATE',
                row: i,
                col: w,
                value: dp[i][w],
                dependencies: [[i - 1, w]]
              });
            }
          } else {
            // Item weight exceeds current capacity w; must exclude
            dp[i][w] = dp[i - 1][w];
            pushEvent({
              type: 'MATRIX_CELL_UPDATE',
              row: i,
              col: w,
              value: dp[i][w],
              dependencies: [[i - 1, w]]
            });
          }
        }
      }
    }

    const optimalValue = dp[n][capacity];
    pushEvent({
      type: 'SYSTEM_LOG',
      message: `Knapsack DP completed. Optimal value achieved: ${optimalValue}. Beginning backtracking to identify selected items.`,
      level: 'INFO'
    });

    // Phase 3: Backtracking to find picked items
    let res = optimalValue;
    let w = capacity;
    const pickedIndices: number[] = [];

    for (let i = n; i > 0 && res > 0; i--) {
      // If the value is different from the one above, it means the item was included
      if (res !== dp[i - 1][w]) {
        pickedIndices.push(i - 1);
        
        // Highlight the path and the "PICKED" cell
        pushEvent({
          type: 'MATRIX_CELL_HIGHLIGHT',
          row: i,
          col: w,
          color: '#10b981' // Emerald/Green for picked
        });

        res -= items[i - 1].value;
        w -= items[i - 1].weight;

        pushEvent({
          type: 'SYSTEM_LOG',
          message: `Backtracking: Item ${i} (value ${items[i-1].value}) was PICKED. Remaining value: ${res}, Remaining capacity: ${w}.`,
          level: 'INFO'
        });
      } else {
        // Highlight the "SKIPPED" cell
        pushEvent({
          type: 'MATRIX_CELL_HIGHLIGHT',
          row: i,
          col: w,
          color: '#ef4444' // Red for skipped in backtrack
        });
        
        pushEvent({
          type: 'SYSTEM_LOG',
          message: `Backtracking: Item ${i} was NOT picked. Moving to previous item at same capacity.`,
          level: 'INFO'
        });
      }
    }

    // Emit final highlight for the base case reached
    pushEvent({
      type: 'MATRIX_CELL_HIGHLIGHT',
      row: 0,
      col: w,
      color: '#3b82f6' // Blue for start of path
    });

    // Send the final list of picked items in a special event
    pushEvent({
      type: 'KNAPSACK_FINAL_SELECTION',
      indices: pickedIndices,
      items: pickedIndices.map(idx => items[idx]),
      totalValue: optimalValue,
      totalWeight: capacity - w
    });

    const endTime = performance.now();

    return {
      events,
      metadata: {
        timeComplexity: 'O(n * W)',
        spaceComplexity: 'O(n * W)',
        executionTimeMs: endTime - startTime,
        nodeCount: (n + 1) * (capacity + 1),
        algorithmName: this.name,
        rowHeaders,
        colHeaders,
        items // Pass items in metadata for the UI to use in the inventory
      }
    };
  }
}
