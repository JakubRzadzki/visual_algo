/**
 * @file heapSortFrames.ts
 * @description Snapshot frame generator for the Heap Sort algorithm.
 *
 * Time Complexity:  O(n log n) in all cases
 * Space Complexity: O(1) auxiliary
 */

import type { SortFrame, SortResult } from '../types';

/**
 * Generates all visualization frames for a Heap Sort execution.
 *
 * @param input - The unsorted array of numbers.
 * @returns SortResult containing ordered frames and algorithm metadata.
 */
export function generateHeapSortFrames(input: number[]): SortResult {
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

  snap([], [], null, 'Starting Heap Sort');

  /** Sift-down (max-heapify) subtree rooted at index i within arr[0..heapSize-1]. */
  function heapify(heapSize: number, i: number): void {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < heapSize) {
      comparisons++;
      arrayAccesses += 2;
      snap([largest, left], [], null, `Comparing arr[${largest}]=${arr[largest]} with left child arr[${left}]=${arr[left]}`);
      if (arr[left] > arr[largest]) largest = left;
    }

    if (right < heapSize) {
      comparisons++;
      arrayAccesses += 2;
      snap([largest, right], [], null, `Comparing arr[${largest}]=${arr[largest]} with right child arr[${right}]=${arr[right]}`);
      if (arr[right] > arr[largest]) largest = right;
    }

    if (largest !== i) {
      snap([], [i, largest], null, `Swapping arr[${i}]=${arr[i]} ↔ arr[${largest}]=${arr[largest]}`);
      const temp = arr[i];
      arr[i] = arr[largest];
      arr[largest] = temp;
      arrayAccesses += 4;
      snap([], [i, largest], null, `Swapped → arr[${i}]=${arr[i]}, arr[${largest}]=${arr[largest]}`);

      // Recursively heapify the affected sub-tree
      heapify(heapSize, largest);
    }
  }

  // Phase 1: Build max-heap from input array (bottom-up, O(n))
  snap([], [], null, 'Phase 1: Building max-heap');
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(n, i);
  }
  snap([], [], null, 'Max-heap built successfully');

  // Phase 2: Extract elements one by one from the heap
  snap([], [], null, 'Phase 2: Extracting sorted elements');
  for (let i = n - 1; i > 0; i--) {
    // Move current root (max) to end
    snap([], [0, i], null, `Moving max ${arr[0]} to position ${i}`);
    const temp = arr[0];
    arr[0] = arr[i];
    arr[i] = temp;
    arrayAccesses += 4;

    sortedIndices.add(i);
    snap([], [], null, `Element ${arr[i]} placed at final position ${i}`);

    // Restore heap property on reduced heap
    heapify(i, 0);
  }

  sortedIndices.add(0);
  snap([], [], null, 'Heap Sort complete!');

  return {
    frames,
    info: {
      name: 'Heap Sort',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(1)',
      bestCase: 'O(n log n)',
      averageCase: 'O(n log n)',
    },
  };
}
