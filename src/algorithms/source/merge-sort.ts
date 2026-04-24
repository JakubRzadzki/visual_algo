// ─── Merge Sort ────────────────────────────────────────────────────────────────
// Time:  O(n log n) — always, regardless of input distribution
// Space: O(n)       — auxiliary arrays during merge
//
// Divide-and-conquer: recursively split the array in half, sort each half,
// then merge the two sorted halves back together.

function mergeSort(arr: number[], start: number, end: number): void {
  if (start >= end) return;

  const mid = Math.floor((start + end) / 2);

  // Recursively sort both halves
  mergeSort(arr, start, mid);
  mergeSort(arr, mid + 1, end);

  // Merge the sorted halves
  merge(arr, start, mid, end);
}

function merge(arr: number[], start: number, mid: number, end: number): void {
  let leftIdx = start;
  let rightIdx = mid + 1;
  const temp: number[] = [];

  // Compare elements from both halves and build sorted temp array
  while (leftIdx <= mid && rightIdx <= end) {
    if (arr[leftIdx] <= arr[rightIdx]) {
      temp.push(arr[leftIdx++]);
    } else {
      temp.push(arr[rightIdx++]);
    }
  }

  // Copy remaining elements from left half
  while (leftIdx <= mid) {
    temp.push(arr[leftIdx++]);
  }

  // Copy remaining elements from right half
  while (rightIdx <= end) {
    temp.push(arr[rightIdx++]);
  }

  // Write merged result back into original array
  for (let i = start; i <= end; i++) {
    arr[i] = temp[i - start];
  }
}

// Example usage:
// const data = [42, 15, 8, 93, 27, 61, 39, 10, 55, 33];
// mergeSort(data, 0, data.length - 1);
// console.log(data); // → [8, 10, 15, 27, 33, 39, 42, 55, 61, 93]

export { mergeSort, merge };
