# Red-Black Tree Node Insertion and Balancing in Python
# Implements a self-balancing binary search tree with node coloring (Red/Black).

RED = "red"
BLACK = "black"

class Node:
    def __init__(self, value, color=RED):
        self.value = value
        self.color = color
        self.left = None
        self.right = None
        self.parent = None

class RedBlackTree:
    def __init__(self):
        self.root = None

    def insert(self, value):
        """
        Inserts a node into the BST and performs rotations / recoloring
        to maintain Red-Black tree properties.
        """
        new_node = Node(value, RED)
        # Standard BST insertion
        parent = None
        curr = self.root
        while curr:
            parent = curr
            if value < curr.value:
                curr = curr.left
            else:
                curr = curr.right

        new_node.parent = parent
        if parent is None:
            self.root = new_node
        elif value < parent.value:
            parent.left = new_node
        else:
            parent.right = new_node

        # Fix Red-Black Tree violations
        self.fix_insert(new_node)

    def fix_insert(self, node):
        """
        Performs recoloring and tree rotations to fix double-red violations.
        """
        while node.parent and node.parent.color == RED:
            if node.parent == node.parent.parent.left:
                uncle = node.parent.parent.right
                if uncle and uncle.color == RED:
                    # Case 1: Uncle is red -> Recolor parent, uncle, and grandparent
                    node.parent.color = BLACK
                    uncle.color = BLACK
                    node.parent.parent.color = RED
                    node = node.parent.parent
                else:
                    if node == node.parent.right:
                        # Case 2: Uncle is black, node is right child -> Left rotate
                        node = node.parent
                        self.left_rotate(node)
                    # Case 3: Uncle is black, node is left child -> Right rotate & Recolor
                    node.parent.color = BLACK
                    node.parent.parent.color = RED
                    self.right_rotate(node.parent.parent)
            else:
                uncle = node.parent.parent.left
                if uncle and uncle.color == RED:
                    node.parent.color = BLACK
                    uncle.color = BLACK
                    node.parent.parent.color = RED
                    node = node.parent.parent
                else:
                    if node == node.parent.left:
                        node = node.parent
                        self.right_rotate(node)
                    node.parent.color = BLACK
                    node.parent.parent.color = RED
                    self.left_rotate(node.parent.parent)
        self.root.color = BLACK

    def left_rotate(self, x):
        y = x.right
        x.right = y.left
        if y.left:
            y.left.parent = x
        y.parent = x.parent
        if not x.parent:
            self.root = y
        elif x == x.parent.left:
            x.parent.left = y
        else:
            x.parent.right = y
        y.left = x
        x.parent = y

    def right_rotate(self, y):
        x = y.left
        y.left = x.right
        if x.right:
            x.right.parent = y
        x.parent = y.parent
        if not y.parent:
            self.root = x
        elif y == y.parent.right:
            y.parent.right = x
        else:
            y.parent.left = x
        x.right = y
        y.parent = x
