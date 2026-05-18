# Binary Search Tree Insertion
import json
import time


def emit(event_type, **kwargs):
    event = {"type": event_type}
    event.update(kwargs)
    print(json.dumps(event))


class Node:
    def __init__(self, key):
        self.key = key
        self.id = f"node-{key}"
        self.left = None
        self.right = None


def insert(root, key):
    if root is None:
        emit("INSERT", nodeIds=[f"node-{key}"])
        return Node(key)
    else:
        emit("COMPARE", nodeIds=[root.id])
        if root.key < key:
            root.right = insert(root.right, key)
        else:
            root.left = insert(root.left, key)
    return root


# Example usage:
arr = [15, 10, 20, 8, 12, 17, 25]
root = None

emit("SYSTEM_LOG", level="INFO", message="Building BST...")
for val in arr:
    root = insert(root, val)
    time.sleep(0.05)
