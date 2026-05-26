# AVL Tree Insertion
# An AVL tree is a self-balancing binary search tree.

import json


def emit(event_type, **kwargs):
    event = {"type": event_type}
    event.update(kwargs)
    print(json.dumps(event))


class AVLNode:
    def __init__(self, key, node_id):
        self.key = key
        self.id = node_id
        self.left = None
        self.right = None
        self.height = 1


def get_height(root):
    if not root:
        return 0
    return root.height


def get_balance(root):
    if not root:
        return 0
    return get_height(root.left) - get_height(root.right)


def right_rotate(y):
    emit("TREE_ROTATE", pivotId=y.id, direction="RIGHT")
    x = y.left
    T2 = x.right
    x.right = y
    y.left = T2
    y.height = 1 + max(get_height(y.left), get_height(y.right))
    x.height = 1 + max(get_height(x.left), get_height(x.right))
    return x


def left_rotate(x):
    emit("TREE_ROTATE", pivotId=x.id, direction="LEFT")
    y = x.right
    T2 = y.left
    y.left = x
    x.right = T2
    x.height = 1 + max(get_height(x.left), get_height(x.right))
    y.height = 1 + max(get_height(y.left), get_height(y.right))
    return y


def insert(root, key, parent_id=None):
    if not root:
        node_id = f"n{key}"
        emit("GRAPH_NODE_ADD", nodeId=node_id)
        if parent_id:
            emit("GRAPH_EDGE_ADD", edgeId=f"e{parent_id}-{node_id}", fromNode=parent_id, to=node_id)
        emit("GRAPH_NODE_HIGHLIGHT", nodeId=node_id, status="visited")
        return AVLNode(key, node_id)

    emit("GRAPH_NODE_HIGHLIGHT", nodeId=root.id, status="current")

    if key < root.key:
        if root.left:
            emit("GRAPH_EDGE_HIGHLIGHT", edgeId=f"e{root.id}-{root.left.id}", accepted=True)
        root.left = insert(root.left, key, root.id)
    elif key > root.key:
        if root.right:
            emit("GRAPH_EDGE_HIGHLIGHT", edgeId=f"e{root.id}-{root.right.id}", accepted=True)
        root.right = insert(root.right, key, root.id)
    else:
        return root

    root.height = 1 + max(get_height(root.left), get_height(root.right))
    balance = get_balance(root)

    # LL
    if balance > 1 and key < root.left.key:
        return right_rotate(root)
    # RR
    if balance < -1 and key > root.right.key:
        return left_rotate(root)
    # LR
    if balance > 1 and key > root.left.key:
        root.left = left_rotate(root.left)
        return right_rotate(root)
    # RL
    if balance < -1 and key < root.right.key:
        root.right = right_rotate(root.right)
        return left_rotate(root)

    return root


def generate_static_layout(arr):
    # Quick build to figure out final edges and nodes for INIT
    class SNode:
        def __init__(self, val, nid):
            self.val = val
            self.id = nid
            self.left = None
            self.right = None
            self.height = 1
    
    def sheight(n): return n.height if n else 0
    def sbal(n): return sheight(n.left) - sheight(n.right) if n else 0
    def s_right(y):
        x = y.left; y.left = x.right; x.right = y
        y.height = 1 + max(sheight(y.left), sheight(y.right))
        x.height = 1 + max(sheight(x.left), sheight(x.right))
        return x
    def s_left(x):
        y = x.right; x.right = y.left; y.left = x
        x.height = 1 + max(sheight(x.left), sheight(x.right))
        y.height = 1 + max(sheight(y.left), sheight(y.right))
        return y
    def s_ins(node, val):
        if not node: return SNode(val, f"n{val}")
        if val < node.val: node.left = s_ins(node.left, val)
        elif val > node.val: node.right = s_ins(node.right, val)
        else: return node
        node.height = 1 + max(sheight(node.left), sheight(node.right))
        bal = sbal(node)
        if bal > 1 and val < node.left.val: return s_right(node)
        if bal < -1 and val > node.right.val: return s_left(node)
        if bal > 1 and val > node.left.val:
            node.left = s_left(node.left)
            return s_right(node)
        if bal < -1 and val < node.right.val:
            node.right = s_right(node.right)
            return s_left(node)
        return node

    s_root = None
    for v in arr: s_root = s_ins(s_root, v)
    
    nodes, edges = [], []
    def traverse(n):
        if not n: return
        nodes.append({"id": n.id, "label": str(n.val), "hidden": True, "x": 0, "y": 0, "vx": 0, "vy": 0})
        if n.left:
            edges.append({"id": f"e{n.id}-{n.left.id}", "from": n.id, "to": n.left.id, "hidden": True, "weight": 0})
            traverse(n.left)
        if n.right:
            edges.append({"id": f"e{n.id}-{n.right.id}", "from": n.id, "to": n.right.id, "hidden": True, "weight": 0})
            traverse(n.right)
    traverse(s_root)
    return {"nodes": nodes, "edges": edges, "isDirected": True, "layoutHint": "dagre"}


if __name__ == "__main__":
    arr = [10, 20, 30, 40, 50, 25]
    emit("INIT", graph=generate_static_layout(arr))
    
    emit("SYSTEM_LOG", level="INFO", message="Starting AVL Tree construction.")
    root = None
    for val in arr:
        emit("SYSTEM_LOG", level="INFO", message=f"Inserting {val}")
        root = insert(root, val)

