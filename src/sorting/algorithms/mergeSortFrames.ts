/**
 * @file mergeSortFrames.ts
 * @description Snapshot frame generator for the Merge Sort algorithm.
 *
 * Uses a standard top-down recursive approach. Generates SortFrame objects
 * for deterministic playback with highlighting for merge operations.
 *
 * Time Complexity:  O(n log n) in all cases
 * Space Complexity: O(n)
 */

import type { SortFrame, SortResult } from "../types";

/**
 * Generates all visualization frames for a Merge Sort execution.
 *
 * @param input - The unsorted array of numbers.
 * @returns SortResult containing ordered frames and algorithm metadata.
 */
export function generateMergeSortFrames(input: number[]): SortResult {
  const arr = [...input];
  const n = arr.length;
  const frames: SortFrame[] = [];
  const sortedIndices: Set<number> = new Set();
  let comparisons = 0;
  let arrayAccesses = 0;

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

  snap([], [], null, "Starting Merge Sort");

  /**
   * Merge two sorted subarrays arr[lo..mid] and arr[mid+1..hi] in-place
   * by using a temporary buffer and writing back to the original array.
   */
  function merge(lo: number, mid: number, hi: number): void {
    const left = arr.slice(lo, mid + 1);
    const right = arr.slice(mid + 1, hi + 1);
    arrayAccesses += hi - lo + 1;

    let i = 0;
    let j = 0;
    let k = lo;

    snap(
      [],
      [],
      null,
      `Merging subarrays [${lo}..${mid}] and [${mid + 1}..${hi}]`,
    );

    while (i < left.length && j < right.length) {
      comparisons++;
      arrayAccesses += 2;
      snap(
        [lo + i, mid + 1 + j],
        [],
        null,
        `Comparing ${left[i]} and ${right[j]}`,
      );

      if (left[i] <= right[j]) {
        arr[k] = left[i];
        arrayAccesses++;
        snap([], [k], null, `Placing ${left[i]} at index ${k}`);
        i++;
      } else {
        arr[k] = right[j];
        arrayAccesses++;
        snap([], [k], null, `Placing ${right[j]} at index ${k}`);
        j++;
      }
      k++;
    }

    while (i < left.length) {
      arr[k] = left[i];
      arrayAccesses++;
      snap([], [k], null, `Placing remaining ${left[i]} at index ${k}`);
      i++;
      k++;
    }

    while (j < right.length) {
      arr[k] = right[j];
      arrayAccesses++;
      snap([], [k], null, `Placing remaining ${right[j]} at index ${k}`);
      j++;
      k++;
    }
  }

  function mergeSort(lo: number, hi: number): void {
    if (lo >= hi) {
      if (lo === hi) sortedIndices.add(lo);
      return;
    }

    const mid = Math.floor((lo + hi) / 2);
    mergeSort(lo, mid);
    mergeSort(mid + 1, hi);
    merge(lo, mid, hi);
  }

  mergeSort(0, n - 1);

  for (let i = 0; i < n; i++) sortedIndices.add(i);
  snap([], [], null, "Merge Sort complete!");

  return {
    frames,
    info: {
      name: "Merge Sort",
      timeComplexity: "O(n log n)",
      spaceComplexity: "O(n)",
      bestCase: "O(n log n)",
      averageCase: "O(n log n)",
    },
  };
}
