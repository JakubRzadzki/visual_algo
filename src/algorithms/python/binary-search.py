import json


def emit(event_type, **kwargs):
    event = {"type": event_type}
    event.update(kwargs)
    print(json.dumps(event))


def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        emit("SEARCH_NARROW", left=left, right=right, mid=mid)
        emit("SEARCH_CHECK", index=mid, value=arr[mid], target=target)
        if arr[mid] == target:
            emit("SEARCH_FOUND", index=mid, value=arr[mid])
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    emit("SEARCH_NOT_FOUND", target=target)
    return -1


if __name__ == "__main__":
    arr = [3, 9, 10, 27, 38, 43, 82]
    target = 38
    emit("INIT", array=arr[:])
    binary_search(arr, target)
