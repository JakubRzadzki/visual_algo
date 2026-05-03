import json

def emit(event_type, **kwargs):
    event = {"type": event_type}
    event.update(kwargs)
    print(json.dumps(event))

def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        swapped = False
        for j in range(n - i - 1):
            emit("ARRAY_COMPARE", indices=[j, j+1])
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
                emit("ARRAY_SWAP", indices=[j, j+1], values=[arr[j], arr[j+1]])
                swapped = True
        if not swapped:
            break
    return arr

if __name__ == "__main__":
    arr = [64, 34, 25, 12, 22, 11, 90]
    bubble_sort(arr)
