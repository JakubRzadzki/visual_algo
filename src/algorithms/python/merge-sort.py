import json


def emit(event_type, **kwargs):
    event = {"type": event_type}
    event.update(kwargs)
    print(json.dumps(event))


def merge(arr, l, m, r):
    left = arr[l : m + 1]
    right = arr[m + 1 : r + 1]
    i = j = 0
    k = l
    while i < len(left) and j < len(right):
        emit("ARRAY_COMPARE", indices=[l + i, m + 1 + j])
        if left[i] <= right[j]:
            emit("ARRAY_SET", index=k, value=left[i])
            arr[k] = left[i]
            i += 1
        else:
            emit("ARRAY_SET", index=k, value=right[j])
            arr[k] = right[j]
            j += 1
        k += 1
    while i < len(left):
        emit("ARRAY_SET", index=k, value=left[i])
        arr[k] = left[i]
        i += 1
        k += 1
    while j < len(right):
        emit("ARRAY_SET", index=k, value=right[j])
        arr[k] = right[j]
        j += 1
        k += 1


def merge_sort(arr, left, right):
    if left < right:
        mid = (left + right) // 2
        merge_sort(arr, left, mid)
        merge_sort(arr, mid + 1, right)
        merge(arr, left, mid, right)


if __name__ == "__main__":
    arr = [38, 27, 43, 3, 9, 82, 10]
    emit("INIT", array=arr[:])
    merge_sort(arr, 0, len(arr) - 1)
