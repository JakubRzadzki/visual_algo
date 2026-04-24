// ─── Quick Sort (Lomuto Partition) ─────────────────────────────────────────────
// Time:  O(n log n) average, O(n²) worst-case (rare with random pivots)
// Space: O(log n)   — recursion stack depth
//
// In-place comparison sort. Picks a pivot (last element, Lomuto scheme),
// partitions the array so elements < pivot are on the left, then recurses.

function quickSort(arr: number[], low: number, high: number): void {
  if (low < high) {
    const pi = partition(arr, low, high);
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
}

function partition(arr: number[], low: number, high: number): number {
  const pivot = arr[high];
  let i = low - 1;

  for (let j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}

// Example usage:
// const data = [42, 15, 8, 93, 27, 61, 39, 10, 55, 33];
// quickSort(data, 0, data.length - 1);
// console.log(data); // → [8, 10, 15, 27, 33, 39, 42, 55, 61, 93]

export { quickSort, partition };
