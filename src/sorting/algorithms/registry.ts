/**
 * @file registry.ts
 * @description Central registry mapping algorithm IDs to their frame generators.
 *
 * Provides a single lookup point for the SortingVisualizer to resolve
 * an algorithm name to its frame generation function.
 */

import type { SortAlgorithmId, FrameGenerator } from "../types";
import { generateBubbleSortFrames } from "./bubbleSort";
import { generateQuickSortFrames } from "./quickSort";
import { generateMergeSortFrames } from "./mergeSortFrames";
import { generateHeapSortFrames } from "./heapSortFrames";

/** Map of algorithm IDs to their frame generator functions. */
export const ALGORITHM_REGISTRY: Record<SortAlgorithmId, FrameGenerator> = {
  "bubble-sort": generateBubbleSortFrames,
  "quick-sort": generateQuickSortFrames,
  "merge-sort": generateMergeSortFrames,
  "heap-sort": generateHeapSortFrames,
};

/**
 * Resolves a human-readable algorithm name (e.g., "Bubble Sort") to
 * its registry key (e.g., "bubble-sort").
 *
 * @param name - Display name from the catalog.
 * @returns The SortAlgorithmId, or null if not found.
 */
export function resolveAlgorithmId(name: string): SortAlgorithmId | null {
  const normalized = name.toLowerCase().replace(/\s+/g, "-");
  if (normalized in ALGORITHM_REGISTRY) return normalized as SortAlgorithmId;

  // Fuzzy match by substring
  const entries = Object.keys(ALGORITHM_REGISTRY) as SortAlgorithmId[];
  return (
    entries.find((id) => normalized.includes(id) || id.includes(normalized)) ??
    null
  );
}
