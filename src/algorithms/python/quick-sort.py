import json

def emit(event_type, **kwargs):
    event = {"type": event_type}
    event.update(kwargs)
    print(json.dumps(event))

def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        emit("ARRAY_COMPARE", indices=[j, high])
        if arr[j] < pivot:
            i += 1
            if i != j:
                emit("ARRAY_SWAP", indices=[i, j], values=[arr[j], arr[i]])
                arr[i], arr[j] = arr[j], arr[i]
    if i + 1 != high:
        emit("ARRAY_SWAP", indices=[i + 1, high], values=[arr[high], arr[i + 1]])
        arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1

def quick_sort(arr, low, high):
    if low < high:
        pi = partition(arr, low, high)
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)

if __name__ == "__main__":
    arr = [29, 10, 14, 37, 14, 25, 1, 31, 9, 22]
    emit("INIT", array=arr[:])
    quick_sort(arr, 0, len(arr) - 1)
