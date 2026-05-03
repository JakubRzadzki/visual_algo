import json

def emit(event_type, **kwargs):
    event = {"type": event_type}
    event.update(kwargs)
    print(json.dumps(event))

def linear_search(arr, target):
    for i, val in enumerate(arr):
        emit("SEARCH_CHECK", index=i, value=val, target=target)
        if val == target:
            emit("SEARCH_FOUND", index=i, value=val)
            return i
    emit("SEARCH_NOT_FOUND", target=target)
    return -1

if __name__ == "__main__":
    arr = [10, 24, 32, 45, 50, 68, 71, 89]
    target = 50
    linear_search(arr, target)
