export function quickSort(
  arr: number[],
  low: number = 0,
  high: number = arr.length - 1,
): number[] {
  if (low < high) {
    const pi = partition(arr, low, high);
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
  return arr;
}

function partition(arr: number[], low: number, high: number): number {
  const pivot = arr[high];
  let i = low - 1;

  for (let j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      // Swap arr[i] and arr[j]
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
  }
  // Swap arr[i+1] and arr[high] (pivot)
  const temp = arr[i + 1];
  arr[i + 1] = arr[high];
  arr[high] = temp;

  return i + 1;
}
