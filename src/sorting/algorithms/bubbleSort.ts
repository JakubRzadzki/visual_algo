/**
 * @file bubbleSort.ts
 * @description Snapshot frame generator for the Bubble Sort algorithm.
 *
 * Generates a complete array of SortFrame objects representing every
 * discrete step of the algorithm's execution. No mutations occur at
 * render time — this runs once eagerly and the playback hook iterates.
 *
 * Time Complexity:  O(n²) average and worst case
 * Space Complexity: O(1) auxiliary (O(n²) frames stored for playback)
 */

import type { SortFrame, SortResult } from '../types';

/**
 * Generates all visualization frames for a Bubble Sort execution.
 *
 * @param input - The unsorted array of numbers.
 * @returns SortResult containing ordered frames and algorithm metadata.
 */
export function generateBubbleSortFrames(input: number[]): SortResult {
  const arr = [...input];
  const n = arr.length;
  const frames: SortFrame[] = [];
  const sortedIndices: number[] = [];
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
  snap([], [], null, 'Starting Bubble Sort');

  // Phase: Outer pass loop — each pass bubbles the largest unsorted element to the end
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;

    // Phase: Inner comparison loop
    for (let j = 0; j < n - i - 1; j++) {
      // Record comparison
      comparisons++;
      arrayAccesses += 2;
      snap([j, j + 1], [], null, `Comparing arr[${j}]=${arr[j]} and arr[${j + 1}]=${arr[j + 1]}`);

      if (arr[j] > arr[j + 1]) {
        // Record swap
        snap([], [j, j + 1], null, `Swapping ${arr[j]} ↔ ${arr[j + 1]}`);

        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
        arrayAccesses += 4;
        swapped = true;

        // Post-swap state
        snap([], [j, j + 1], null, `Swapped → arr[${j}]=${arr[j]}, arr[${j + 1}]=${arr[j + 1]}`);
      }
    }

    // Mark the last unsorted position as sorted
    sortedIndices.push(n - 1 - i);
    snap([], [], null, `Pass ${i + 1} complete — element ${arr[n - 1 - i]} is in place`);

    // Early exit if no swaps occurred (array already sorted)
    if (!swapped) {
      for (let k = 0; k < n - i - 1; k++) {
        if (!sortedIndices.includes(k)) sortedIndices.push(k);
      }
      snap([], [], null, 'Array is already sorted — early exit');
      break;
    }
  }

  // Mark all remaining as sorted
  for (let i = 0; i < n; i++) {
    if (!sortedIndices.includes(i)) sortedIndices.push(i);
  }
  snap([], [], null, 'Bubble Sort complete!');

  return {
    frames,
    info: {
      name: 'Bubble Sort',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)',
      bestCase: 'O(n)',
      averageCase: 'O(n²)',
    },
  };
}
