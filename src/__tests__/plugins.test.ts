import { describe, it, expect } from 'vitest';
import { MergeSortPlugin } from '../core/plugins/sorting/MergeSortPlugin';
import { QuickSortPlugin } from '../core/plugins/sorting/QuickSortPlugin';

// We mock crypto and performance for deterministic snapshots
const mockId = '00000000-0000-0000-0000-000000000000';
if (typeof crypto === 'undefined') {
  global.crypto = {
    randomUUID: () => mockId,
  } as unknown as Crypto;
} else {
  crypto.randomUUID = () => mockId;
}

if (typeof performance === 'undefined') {
  global.performance = {
    now: () => 0,
  } as unknown as Performance;
} else {
  performance.now = () => 0;
}

describe('Sorting Plugins', () => {
  const testInput = [5, 3, 8, 1, 2];

  it('MergeSort should produce deterministic execution trace', () => {
    const plugin = new MergeSortPlugin();
    const trace = plugin.execute(testInput);
    
    // Ensure the output is fully deterministic before snapping
    expect(trace).toMatchSnapshot();
  });

  it('QuickSort should produce deterministic execution trace', () => {
    const plugin = new QuickSortPlugin();
    const trace = plugin.execute(testInput);

    // Ensure the output is fully deterministic before snapping
    expect(trace).toMatchSnapshot();
  });
});
