import { describe, it, expect, beforeAll } from 'vitest';
import { BubbleSortPlugin } from '../core/plugins/sorting/BubbleSortPlugin';
import { HeapSortPlugin } from '../core/plugins/sorting/HeapSortPlugin';
import { BinarySearchPlugin } from '../core/plugins/searching/BinarySearchPlugin';
import { LinearSearchPlugin } from '../core/plugins/searching/LinearSearchPlugin';

// Mock crypto and performance for deterministic snapshots
const mockId = '00000000-0000-0000-0000-000000000000';
beforeAll(() => {
  if (typeof crypto === 'undefined') {
    global.crypto = { randomUUID: () => mockId } as unknown as Crypto;
  } else {
    crypto.randomUUID = () => mockId;
  }
  if (typeof performance === 'undefined') {
    global.performance = { now: () => 0 } as unknown as Performance;
  } else {
    performance.now = () => 0;
  }
});

// ─── Step 9: Sorting Plugin Tests ─────────────────────────────────────────────

describe('BubbleSortPlugin', () => {
  const plugin = new BubbleSortPlugin();

  it('should have correct metadata', () => {
    expect(plugin.id).toBe('bubble-sort');
    expect(plugin.name).toBe('Bubble Sort');
    expect(plugin.category).toBe('sorting');
  });

  it('should sort the array correctly', () => {
    const values = [5, 3, 8, 1, 2];
    const trace = plugin.execute({ values });

    // Replay swaps to verify the final state
    const arr = [...values];
    for (const event of trace.events) {
      if (event.type === 'ARRAY_SWAP') {
        const [i, j] = event.indices;
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
    expect(arr).toEqual([1, 2, 3, 5, 8]);
  });

  it('should produce ARRAY_COMPARE and ARRAY_SWAP events', () => {
    const trace = plugin.execute({ values: [4, 2, 1] });
    const compareEvents = trace.events.filter(e => e.type === 'ARRAY_COMPARE');
    const swapEvents = trace.events.filter(e => e.type === 'ARRAY_SWAP');
    expect(compareEvents.length).toBeGreaterThan(0);
    expect(swapEvents.length).toBeGreaterThan(0);
  });

  it('should early-exit on already sorted array', () => {
    const sorted = [1, 2, 3, 4, 5];
    const trace = plugin.execute({ values: sorted });
    // Only one pass of n-1 comparisons, no swaps
    const swapEvents = trace.events.filter(e => e.type === 'ARRAY_SWAP');
    expect(swapEvents.length).toBe(0);
  });

  it('should handle single-element array', () => {
    const trace = plugin.execute({ values: [42] });
    expect(trace.events.length).toBe(0);
    expect(trace.metadata.nodeCount).toBe(1);
  });

  it('should handle empty array', () => {
    const trace = plugin.execute({ values: [] });
    expect(trace.events.length).toBe(0);
    expect(trace.metadata.nodeCount).toBe(0);
  });

  it('should set correct metadata', () => {
    const trace = plugin.execute({ values: [3, 1, 2] });
    expect(trace.metadata.timeComplexity).toBe('O(n²)');
    expect(trace.metadata.spaceComplexity).toBe('O(1)');
    expect(trace.metadata.algorithmName).toBe('Bubble Sort');
    expect(trace.metadata.initialState).toEqual([3, 1, 2]);
  });
});

describe('HeapSortPlugin', () => {
  const plugin = new HeapSortPlugin();

  it('should have correct metadata', () => {
    expect(plugin.id).toBe('heap-sort');
    expect(plugin.name).toBe('Heap Sort');
    expect(plugin.category).toBe('sorting');
  });

  it('should sort the array correctly', () => {
    const values = [12, 11, 13, 5, 6, 7];
    const trace = plugin.execute({ values });

    // Replay swaps to verify the final state
    const arr = [...values];
    for (const event of trace.events) {
      if (event.type === 'ARRAY_SWAP') {
        const [i, j] = event.indices;
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
    expect(arr).toEqual([5, 6, 7, 11, 12, 13]);
  });

  it('should produce ARRAY_COMPARE and ARRAY_SWAP events', () => {
    const trace = plugin.execute({ values: [9, 4, 7, 1] });
    const compareEvents = trace.events.filter(e => e.type === 'ARRAY_COMPARE');
    const swapEvents = trace.events.filter(e => e.type === 'ARRAY_SWAP');
    expect(compareEvents.length).toBeGreaterThan(0);
    expect(swapEvents.length).toBeGreaterThan(0);
  });

  it('should handle single-element array', () => {
    const trace = plugin.execute({ values: [42] });
    expect(trace.events.length).toBe(0);
    expect(trace.metadata.nodeCount).toBe(1);
  });

  it('should set correct complexity metadata', () => {
    const trace = plugin.execute({ values: [3, 1, 2] });
    expect(trace.metadata.timeComplexity).toBe('O(n log n)');
    expect(trace.metadata.spaceComplexity).toBe('O(1)');
  });
});

// ─── Step 10: Searching Plugin Tests ──────────────────────────────────────────

describe('BinarySearchPlugin', () => {
  const plugin = new BinarySearchPlugin();

  it('should have correct metadata', () => {
    expect(plugin.id).toBe('binary-search');
    expect(plugin.name).toBe('Binary Search');
    expect(plugin.category).toBe('searching');
  });

  it('should find the target element', () => {
    const trace = plugin.execute({ values: [3, 1, 4, 1, 5] });
    const foundEvents = trace.events.filter(e => e.type === 'SEARCH_FOUND');
    expect(foundEvents.length).toBe(1);
  });

  it('should emit SEARCH_NARROW events showing the narrowing window', () => {
    const trace = plugin.execute({ values: [10, 20, 30, 40, 50, 60, 70, 80] });
    const narrowEvents = trace.events.filter(e => e.type === 'SEARCH_NARROW');
    expect(narrowEvents.length).toBeGreaterThan(0);
  });

  it('should emit SEARCH_CHECK events', () => {
    const trace = plugin.execute({ values: [1, 2, 3, 4, 5] });
    const checkEvents = trace.events.filter(e => e.type === 'SEARCH_CHECK');
    expect(checkEvents.length).toBeGreaterThan(0);
  });

  it('should produce a sorted initialState', () => {
    const trace = plugin.execute({ values: [5, 3, 1, 4, 2] });
    expect(trace.metadata.initialState).toEqual([1, 2, 3, 4, 5]);
  });

  it('should set correct complexity metadata', () => {
    const trace = plugin.execute({ values: [1, 2, 3] });
    expect(trace.metadata.timeComplexity).toBe('O(log n)');
    expect(trace.metadata.spaceComplexity).toBe('O(1)');
  });
});

describe('LinearSearchPlugin', () => {
  const plugin = new LinearSearchPlugin();

  it('should have correct metadata', () => {
    expect(plugin.id).toBe('linear-search');
    expect(plugin.name).toBe('Linear Search');
    expect(plugin.category).toBe('searching');
  });

  it('should find the target element', () => {
    const trace = plugin.execute({ values: [10, 20, 30] });
    const foundEvents = trace.events.filter(e => e.type === 'SEARCH_FOUND');
    expect(foundEvents.length).toBe(1);
  });

  it('should emit SEARCH_CHECK for each element scanned', () => {
    const values = [10, 20, 30, 40, 50];
    const trace = plugin.execute({ values });
    const checkEvents = trace.events.filter(e => e.type === 'SEARCH_CHECK');
    // Must check at least up to the target element (last element)
    expect(checkEvents.length).toBeGreaterThanOrEqual(1);
    // For the last element as target, it should check all elements
    expect(checkEvents.length).toBe(values.length);
  });

  it('should handle single-element array', () => {
    const trace = plugin.execute({ values: [42] });
    const foundEvents = trace.events.filter(e => e.type === 'SEARCH_FOUND');
    expect(foundEvents.length).toBe(1);
  });

  it('should set correct complexity metadata', () => {
    const trace = plugin.execute({ values: [1, 2, 3] });
    expect(trace.metadata.timeComplexity).toBe('O(n)');
    expect(trace.metadata.spaceComplexity).toBe('O(1)');
  });
});
