/**
 * @file LCSPlugin.ts
 * @description Web Worker plugin implementing the Longest Common Subsequence (LCS) algorithm.
 *
 * Implements AlgorithmPlugin<LCSInput> and emits discrete matrix cell update events
 * for every computed state table[i][j], mapping previous subproblem cell coordinates
 * as direct dependencies for visualization.
 *
 * Time Complexity:  O(m * n)
 * Space Complexity: O(m * n)
 */

import type { 
  AlgorithmPlugin, 
  ExecutionTrace, 
  VisualizationEvent, 
  LCSInput, 
  EventPayload 
} from '../../../types';

/** Default fallback sequences if input strings are not provided. */
const DEFAULT_TEXT1 = 'ABCBDAB';
const DEFAULT_TEXT2 = 'BDCAB';

/**
 * LCSPlugin — Generates deterministic animation traces for the Longest Common Subsequence problem.
 */
export class LCSPlugin implements AlgorithmPlugin<LCSInput> {
  id = 'lcs';
  name = 'Longest Common Subsequence';
  category = 'dp' as const;

  /**
   * Executes the LCS dynamic programming algorithm on two character sequences.
   *
   * @param input - Container holding text1 and text2 strings.
   * @returns An ExecutionTrace driving the matrix visualization table.
   */
  execute(input: LCSInput): ExecutionTrace {
    const text1 = input?.text1 || DEFAULT_TEXT1;
    const text2 = input?.text2 || DEFAULT_TEXT2;

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

    const m = text1.length;
    const n = text2.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    pushEvent({
      type: 'SYSTEM_LOG',
      message: `Initializing Longest Common Subsequence matrix for sequences "${text1}" (len ${m}) and "${text2}" (len ${n}).`,
      level: 'INFO'
    });

    // Generate descriptive headers mapping sequence characters to row/col indices
    const rowHeaders = ['Base (0)', ...text1.split('').map((char, idx) => `T1[${idx}]: ${char}`)];
    const colHeaders = ['Base (0)', ...text2.split('').map((char, idx) => `T2[${idx}]: ${char}`)];

    // Populate the DP table cell by cell
    for (let i = 0; i <= m; i++) {
      for (let j = 0; j <= n; j++) {
        if (i === 0 || j === 0) {
          dp[i][j] = 0;
          pushEvent({
            type: 'MATRIX_CELL_UPDATE',
            row: i,
            col: j,
            value: 0,
            dependencies: []
          });
        } else {
          const char1 = text1[i - 1];
          const char2 = text2[j - 1];

          if (char1 === char2) {
            // Characters match: optimal path takes 1 plus the subproblem excluding both characters
            dp[i][j] = dp[i - 1][j - 1] + 1;
            pushEvent({
              type: 'MATRIX_CELL_UPDATE',
              row: i,
              col: j,
              value: dp[i][j],
              dependencies: [[i - 1, j - 1]]
            });
            pushEvent({
              type: 'SYSTEM_LOG',
              message: `Match found at T1[${i - 1}] == T2[${j - 1}] ('${char1}'). table[${i}][${j}] set to ${dp[i][j]}.`,
              level: 'INFO'
            });
          } else {
            // Characters differ: optimal path takes the max of excluding char1 or excluding char2
            const optionExcludeT1 = dp[i - 1][j];
            const optionExcludeT2 = dp[i][j - 1];

            dp[i][j] = Math.max(optionExcludeT1, optionExcludeT2);
            pushEvent({
              type: 'MATRIX_CELL_UPDATE',
              row: i,
              col: j,
              value: dp[i][j],
              dependencies: [[i - 1, j], [i, j - 1]]
            });
          }
        }
      }
    }

    const maxLcsLength = dp[m][n];
    pushEvent({
      type: 'SYSTEM_LOG',
      message: `LCS Computation complete. Length of Longest Common Subsequence is ${maxLcsLength}. Beginning backtracking to reconstruct the sequence.`,
      level: 'INFO'
    });

    // Phase 3: Backtracking to reconstruct sequence
    let r = m;
    let c = n;
    let lcsReconstructed = '';

    while (r > 0 && c > 0) {
      if (text1[r - 1] === text2[c - 1]) {
        lcsReconstructed = text1[r - 1] + lcsReconstructed;
        
        // Match found - highlight the "PICKED" cell in emerald
        pushEvent({
          type: 'MATRIX_CELL_HIGHLIGHT',
          row: r,
          col: c,
          color: '#10b981' // Emerald
        });
        
        pushEvent({
          type: 'SYSTEM_LOG',
          message: `Backtracking: Match found '${text1[r-1]}' at index [${r}, ${c}].`,
          level: 'INFO'
        });

        r--;
        c--;
      } else if (dp[r - 1][c] >= dp[r][c - 1]) {
        // Highlight the path cell in red (skipped)
        pushEvent({
          type: 'MATRIX_CELL_HIGHLIGHT',
          row: r,
          col: c,
          color: '#ef4444' // Red
        });
        r--;
      } else {
        // Highlight the path cell in red (skipped)
        pushEvent({
          type: 'MATRIX_CELL_HIGHLIGHT',
          row: r,
          col: c,
          color: '#ef4444' // Red
        });
        c--;
      }
    }

    // Final base case highlight
    pushEvent({
      type: 'MATRIX_CELL_HIGHLIGHT',
      row: r,
      col: c,
      color: '#3b82f6' // Blue
    });

    pushEvent({
      type: 'SYSTEM_LOG',
      message: `Reconstruction complete. LCS: "${lcsReconstructed}"`,
      level: 'INFO'
    });

    const endTime = performance.now();

    return {
      events,
      metadata: {
        timeComplexity: 'O(m * n)',
        spaceComplexity: 'O(m * n)',
        executionTimeMs: endTime - startTime,
        nodeCount: (m + 1) * (n + 1),
        algorithmName: this.name,
        rowHeaders,
        colHeaders,
        lcsResult: lcsReconstructed
      }
    };
  }
}
