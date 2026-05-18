/**
 * @file quickSort.ts
 * @description Snapshot frame generator for the Quick Sort algorithm.
 *
 * Uses the Lomuto partition scheme. Generates a complete array of SortFrame
 * objects for deterministic playback. Pivot elements are visually highlighted.
 *
 * Time Complexity:  O(n log n) average, O(n²) worst case
 * Space Complexity: O(log n) recursion stack
 */

import type { SortFrame, SortResult } from "../types";

/**
 * Generates all visualization frames for a Quick Sort execution.
 *
 * @param input - The unsorted array of numbers.
 * @returns SortResult containing ordered frames and algorithm metadata.
 */
export function generateQuickSortFrames(input: number[]): SortResult {
  const arr = [...input];
  const n = arr.length;
  const frames: SortFrame[] = [];
  const sortedIndices: Set<number> = new Set();
  let comparisons = 0;
  let arrayAccesses = 0;

  /** Capture the current state as an immutable frame. */
  const snap = (
    comparing: number[],
    swapping: number[],
    pivot: number | null,
    description: string,
  ): void => {
    frames.push({
      array: [...arr],
      comparing,
      swapping,
      sorted: [...sortedIndices],
      pivot,
      comparisons,
      arrayAccesses,
      description,
    });
  };

  // Initial state
  snap([], [], null, "Starting Quick Sort");

  /**
   * Lomuto partition scheme.
   * Places the pivot (arr[hi]) at its correct sorted position,
   * with all smaller elements to the left and larger to the right.
   */
  function partition(lo: number, hi: number): number {
    const pivotVal = arr[hi];
    arrayAccesses++;
    snap([], [], hi, `Pivot selected: arr[${hi}]=${pivotVal}`);

    let i = lo - 1;

    for (let j = lo; j < hi; j++) {
      comparisons++;
      arrayAccesses++;
      snap(
        [j, hi],
        [],
        hi,
        `Comparing arr[${j}]=${arr[j]} with pivot ${pivotVal}`,
      );

      if (arr[j] <= pivotVal) {
        i++;
        if (i !== j) {
          snap(
            [],
            [i, j],
            hi,
            `Swapping arr[${i}]=${arr[i]} ↔ arr[${j}]=${arr[j]}`,
          );
          const temp = arr[i];
          arr[i] = arr[j];
          arr[j] = temp;
          arrayAccesses += 4;
          snap(
            [],
            [i, j],
            hi,
            `Swapped → arr[${i}]=${arr[i]}, arr[${j}]=${arr[j]}`,
          );
        }
      }
    }

    // Place pivot in its final position
    const pivotPos = i + 1;
    if (pivotPos !== hi) {
      snap(
        [],
        [pivotPos, hi],
        hi,
        `Placing pivot: swap arr[${pivotPos}]=${arr[pivotPos]} ↔ arr[${hi}]=${arr[hi]}`,
      );
      const temp = arr[pivotPos];
      arr[pivotPos] = arr[hi];
      arr[hi] = temp;
      arrayAccesses += 4;
    }

    // Pivot is now in its sorted position
    sortedIndices.add(pivotPos);
    snap([], [], pivotPos, `Pivot ${pivotVal} placed at index ${pivotPos}`);

    return pivotPos;
  }

  /** Recursive quick sort driver. */
  function quickSort(lo: number, hi: number): void {
    if (lo >= hi) {
      // Single element or empty range — already sorted
      if (lo === hi) sortedIndices.add(lo);
      return;
    }

    const p = partition(lo, hi);
    quickSort(lo, p - 1);
    quickSort(p + 1, hi);
  }

  quickSort(0, n - 1);

  // Mark all as sorted
  for (let i = 0; i < n; i++) sortedIndices.add(i);
  snap([], [], null, "Quick Sort complete!");

  return {
    frames,
    info: {
      name: "Quick Sort",
      timeComplexity: "O(n log n)",
      spaceComplexity: "O(log n)",
      bestCase: "O(n log n)",
      averageCase: "O(n log n)",
    },
  };
}
