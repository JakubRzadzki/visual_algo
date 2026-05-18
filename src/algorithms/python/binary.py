# Binary Tree Node Definition and Traversals in Python
# Implements basic hierarchical binary node structure and depth-first/level-order traversals.

import json
import time


def emit(event_type, **kwargs):
    event = {"type": event_type}
    event.update(kwargs)
    print(json.dumps(event))


class Node:
    def __init__(self, value, id):
        self.value = value
        self.id = id
        self.left = None
        self.right = None


def inorder_traversal(root):
    if root is None:
        return []

    left_res = inorder_traversal(root.left)

    emit("VISIT", nodeIds=[root.id])
    time.sleep(0.1)  # Simulate some work

    right_res = inorder_traversal(root.right)
    return left_res + [root.value] + right_res


def preorder_traversal(root):
    if root is None:
        return []

    emit("VISIT", nodeIds=[root.id])
    time.sleep(0.1)

    left_res = preorder_traversal(root.left)
    right_res = preorder_traversal(root.right)
    return [root.value] + left_res + right_res


def postorder_traversal(root):
    if root is None:
        return []

    left_res = postorder_traversal(root.left)
    right_res = postorder_traversal(root.right)

    emit("VISIT", nodeIds=[root.id])
    time.sleep(0.1)

    return left_res + right_res + [root.value]


# Create standard expression binary tree template
root = Node("+", "node-root")
root.left = Node("A", "node-A")
root.right = Node("*", "node-mul")
root.right.left = Node("B", "node-B")
root.right.right = Node("C", "node-C")

emit("SYSTEM_LOG", level="INFO", message="Starting Pre-order Traversal")
preorder_traversal(root)

emit("SYSTEM_LOG", level="INFO", message="Starting In-order Traversal")
inorder_traversal(root)

emit("SYSTEM_LOG", level="INFO", message="Starting Post-order Traversal")
postorder_traversal(root)
