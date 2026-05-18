/**
 * @file types.ts
 * @description Core type definitions for the snapshot-based sorting visualization system.
 *
 * The architecture is built around "SortFrame" — an immutable snapshot capturing
 * the full state of the array at a discrete point in the algorithm's execution.
 * This enables deterministic Play/Pause/Step/Rewind without any mutation or timing hacks.
 */

/** Visual state assigned to each bar in a given frame. */
export type BarStatus =
  | "default"
  | "comparing"
  | "swapping"
  | "sorted"
  | "pivot";

/**
 * A single immutable snapshot of the sorting algorithm's state.
 *
 * Generated eagerly before any animation begins. The playback hook
 * simply iterates through these frames, making the system bulletproof
 * against timing issues and memory leaks.
 */
export interface SortFrame {
  /** Full array state at this point in the algorithm. */
  array: number[];

  /** Indices currently being compared (highlighted yellow/magenta). */
  comparing: number[];

  /** Indices currently being swapped (highlighted cyan/red). */
  swapping: number[];

  /** Indices already in their final sorted position (highlighted green). */
  sorted: number[];

  /** Optional pivot index for algorithms like Quick Sort. */
  pivot: number | null;

  /** Running count of comparisons performed so far. */
  comparisons: number;

  /** Running count of array accesses (reads + writes) performed so far. */
  arrayAccesses: number;

  /** Human-readable label for the current operation (e.g., "Comparing 5 and 3"). */
  description: string;
}

/**
 * Metadata about a sorting algorithm, used for the HUD display.
 */
export interface SortAlgorithmInfo {
  /** Display name (e.g., "Bubble Sort"). */
  name: string;

  /** Worst-case time complexity (e.g., "O(n²)"). */
  timeComplexity: string;

  /** Auxiliary space complexity (e.g., "O(1)"). */
  spaceComplexity: string;

  /** Best-case time complexity (e.g., "O(n)"). */
  bestCase: string;

  /** Average-case time complexity (e.g., "O(n²)"). */
  averageCase: string;
}

/**
 * Complete output from a frame generator function.
 * Contains all pre-computed frames and algorithm metadata.
 */
export interface SortResult {
  /** Ordered list of all frames from start to fully sorted. */
  frames: SortFrame[];

  /** Static metadata about the algorithm. */
  info: SortAlgorithmInfo;
}

/**
 * Union type for supported sorting algorithms.
 * Used as keys in the algorithm registry.
 */
export type SortAlgorithmId =
  | "bubble-sort"
  | "quick-sort"
  | "merge-sort"
  | "heap-sort";

/** Signature for a sorting frame generator function. */
export type FrameGenerator = (input: number[]) => SortResult;
