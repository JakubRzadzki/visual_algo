# Binary Search Tree Insertion
# This is a basic implementation of BST insertion.

class Node:
    def __init__(self, key):
        self.key = key
        self.left = None
        self.right = None

def insert(root, key):
    if root is None:
        return Node(key)
    else:
        if root.key < key:
            root.right = insert(root.right, key)
        else:
            root.left = insert(root.left, key)
    return root

# Example usage:
arr = [15, 10, 20, 8, 12, 17, 25]
root = None
for val in arr:
    root = insert(root, val)
