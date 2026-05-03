import json

def emit(event_type, **kwargs):
    event = {"type": event_type}
    event.update(kwargs)
    print(json.dumps(event))

def heapify(arr, n, i):
    largest = i
    l = 2 * i + 1
    r = 2 * i + 2

    if l < n:
        emit("ARRAY_COMPARE", indices=[l, largest])
        if arr[l] > arr[largest]:
            largest = l

    if r < n:
        emit("ARRAY_COMPARE", indices=[r, largest])
        if arr[r] > arr[largest]:
            largest = r

    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        emit("ARRAY_SWAP", indices=[i, largest], values=[arr[i], arr[largest]])
        heapify(arr, n, largest)

def heap_sort(arr):
    n = len(arr)
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)

    for i in range(n - 1, 0, -1):
        arr[i], arr[0] = arr[0], arr[i]
        emit("ARRAY_SWAP", indices=[0, i], values=[arr[0], arr[i]])
        heapify(arr, i, 0)
    return arr

if __name__ == "__main__":
    arr = [12, 11, 13, 5, 6, 7]
    heap_sort(arr)
