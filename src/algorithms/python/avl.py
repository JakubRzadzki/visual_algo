# AVL Tree Insertion with full visualization trace
# Self-balancing BST where |BF| <= 1 for every node.
# Emits JSON events for each step: insert, traverse, rotate, relayout.

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


# ── Rotations ─────────────────────────────────────────────────────────────

def right_rotate(y):
    x = y.left
    T2 = x.right

    emit("SYSTEM_LOG", level="WARN", message=f"Identyfikacja węzłów: [parent]={y.key} oraz jego LEWE dziecko [pivot]={x.key}.")
    emit("SYSTEM_LOG", level="WARN", message=f"[pivot] {x.key} WZNOSI SIĘ w górę — przejmuje miejsce węzła [parent] {y.key}.")
    emit("SYSTEM_LOG", level="WARN", message=f"[parent] {y.key} OPADA w dół — staje się PRAWYM dzieckiem węzła [pivot] {x.key}.")
    emit("SYSTEM_LOG", level="INFO", message=f"Oryginalne PRAWE poddrzewo węzła [pivot] {x.key} zostaje przeniesione i staje się NOWYM LEWYM dzieckiem węzła [parent] {y.key}.")

    x.right = y
    y.left = T2

    y.height = 1 + max(get_height(y.left), get_height(y.right))
    x.height = 1 + max(get_height(x.left), get_height(x.right))
    
    emit("GRAPH_NODE_HIGHLIGHT", nodeId=x.id, status="rotate")
    emit("GRAPH_NODE_HIGHLIGHT", nodeId=y.id, status="rotate")
    sync_tree(x)
    emit("GRAPH_NODE_HIGHLIGHT", nodeId=x.id, status="default")
    emit("GRAPH_NODE_HIGHLIGHT", nodeId=y.id, status="default")
    return x


def left_rotate(x):
    y = x.right
    T2 = y.left

    emit("SYSTEM_LOG", level="WARN", message=f"Identyfikacja węzłów: [parent]={x.key} oraz jego PRAWE dziecko [pivot]={y.key}.")
    emit("SYSTEM_LOG", level="WARN", message=f"[pivot] {y.key} WZNOSI SIĘ w górę — przejmuje miejsce węzła [parent] {x.key}.")
    emit("SYSTEM_LOG", level="WARN", message=f"[parent] {x.key} OPADA w dół — staje się LEWYM dzieckiem węzła [pivot] {y.key}.")
    emit("SYSTEM_LOG", level="INFO", message=f"Oryginalne LEWE poddrzewo węzła [pivot] {y.key} zostaje przeniesione i staje się NOWYM PRAWYM dzieckiem węzła [parent] {x.key}.")

    y.left = x
    x.right = T2

    x.height = 1 + max(get_height(x.left), get_height(x.right))
    y.height = 1 + max(get_height(y.left), get_height(y.right))
    
    emit("GRAPH_NODE_HIGHLIGHT", nodeId=x.id, status="rotate")
    emit("GRAPH_NODE_HIGHLIGHT", nodeId=y.id, status="rotate")
    sync_tree(y)
    emit("GRAPH_NODE_HIGHLIGHT", nodeId=x.id, status="default")
    emit("GRAPH_NODE_HIGHLIGHT", nodeId=y.id, status="default")
    return y


# ── Edge reconciliation ───────────────────────────────────────────────────

active_edges = set()


def sync_tree(root):
    """Reconcile displayed edges with actual tree structure, then relayout."""
    global active_edges
    desired = {}

    def walk(n):
        if not n:
            return
        if n.left:
            eid = f"e{n.id}-{n.left.id}"
            desired[eid] = (n.id, n.left.id)
            walk(n.left)
        if n.right:
            eid = f"e{n.id}-{n.right.id}"
            desired[eid] = (n.id, n.right.id)
            walk(n.right)

    walk(root)

    # Remove stale edges
    for eid in list(active_edges):
        if eid not in desired:
            emit("GRAPH_EDGE_REMOVE", edgeId=eid)
            active_edges.discard(eid)

    # Add new edges
    for eid, (frm, to) in desired.items():
        if eid not in active_edges:
            emit("GRAPH_EDGE_ADD", edgeId=eid, **{"from": frm}, to=to)
            active_edges.add(eid)


# ── Insert with balance checking ──────────────────────────────────────────

def insert(root, key, parent_id=None):
    if not root:
        node_id = f"n{key}"
        emit("GRAPH_NODE_ADD", nodeId=node_id)
        if parent_id:
            emit("GRAPH_EDGE_ADD", edgeId=f"e{parent_id}-{node_id}",
                 **{"from": parent_id}, to=node_id)
            active_edges.add(f"e{parent_id}-{node_id}")
        emit("GRAPH_NODE_HIGHLIGHT", nodeId=node_id, status="visited")
        return AVLNode(key, node_id)

    emit("GRAPH_NODE_HIGHLIGHT", nodeId=root.id, status="current")

    if key < root.key:
        emit("SYSTEM_LOG", level="INFO",
             message=f"{key} < {root.key} → idę w lewo")
        if root.left:
            emit("GRAPH_EDGE_HIGHLIGHT",
                 edgeId=f"e{root.id}-{root.left.id}", accepted=True)
        root.left = insert(root.left, key, root.id)
    elif key > root.key:
        emit("SYSTEM_LOG", level="INFO",
             message=f"{key} > {root.key} → idę w prawo")
        if root.right:
            emit("GRAPH_EDGE_HIGHLIGHT",
                 edgeId=f"e{root.id}-{root.right.id}", accepted=True)
        root.right = insert(root.right, key, root.id)
    else:
        return root

    root.height = 1 + max(get_height(root.left), get_height(root.right))
    balance = get_balance(root)

    emit("SYSTEM_LOG", level="INFO",
         message=f"BF({root.key}) = {balance}")

    # LL Case
    if balance > 1 and key < root.left.key:
        emit("SYSTEM_LOG", level="WARN",
             message=f"Przypadek LL na węźle {root.key} (BF={balance})")
        result = right_rotate(root)
        sync_tree(result)
        return result

    # RR Case
    if balance < -1 and key > root.right.key:
        emit("SYSTEM_LOG", level="WARN",
             message=f"Przypadek RR na węźle {root.key} (BF={balance})")
        result = left_rotate(root)
        sync_tree(result)
        return result

    # LR Case
    if balance > 1 and key > root.left.key:
        emit("SYSTEM_LOG", level="WARN",
             message=f"Przypadek LR na węźle {root.key} (BF={balance})")
        root.left = left_rotate(root.left)
        sync_tree(root)
        result = right_rotate(root)
        sync_tree(result)
        return result

    # RL Case
    if balance < -1 and key < root.right.key:
        emit("SYSTEM_LOG", level="WARN",
             message=f"Przypadek RL na węźle {root.key} (BF={balance})")
        root.right = right_rotate(root.right)
        sync_tree(root)
        result = left_rotate(root)
        sync_tree(result)
        return result

    return root


# ── Static layout for INIT event ──────────────────────────────────────────

def generate_static_layout(arr):
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
        if not node:
            return SNode(val, f"n{val}")
        if val < node.val:
            node.left = s_ins(node.left, val)
        elif val > node.val:
            node.right = s_ins(node.right, val)
        else:
            return node
        node.height = 1 + max(sheight(node.left), sheight(node.right))
        bal = sbal(node)
        if bal > 1 and val < node.left.val:
            return s_right(node)
        if bal < -1 and val > node.right.val:
            return s_left(node)
        if bal > 1 and val > node.left.val:
            node.left = s_left(node.left)
            return s_right(node)
        if bal < -1 and val < node.right.val:
            node.right = s_right(node.right)
            return s_left(node)
        return node

    s_root = None
    for v in arr:
        s_root = s_ins(s_root, v)

    nodes, edges = [], []

    def traverse(n):
        if not n:
            return
        nodes.append({"id": n.id, "label": str(n.val), "hidden": True,
                       "x": 0, "y": 0, "vx": 0, "vy": 0})
        if n.left:
            edges.append({"id": f"e{n.id}-{n.left.id}", "from": n.id,
                           "to": n.left.id, "hidden": True, "weight": 0})
            traverse(n.left)
        if n.right:
            edges.append({"id": f"e{n.id}-{n.right.id}", "from": n.id,
                           "to": n.right.id, "hidden": True, "weight": 0})
            traverse(n.right)

    traverse(s_root)
    return {"nodes": nodes, "edges": edges,
            "isDirected": True, "layoutHint": "dagre"}


if __name__ == "__main__":
    arr = [10, 20, 30, 40, 50, 25]
    emit("INIT", graph=generate_static_layout(arr))

    emit("SYSTEM_LOG", level="INFO",
         message="Rozpoczynam budowę drzewa AVL.")
    root = None
    for val in arr:
        emit("SYSTEM_LOG", level="INFO", message=f"── Wstawiam {val} ──")
        root = insert(root, val)
        sync_tree(root)
