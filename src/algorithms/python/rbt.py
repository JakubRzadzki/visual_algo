# Red-Black Tree Insertion with full visualization trace
# Self-balancing BST with node coloring (Red/Black).
# Emits JSON events for each step: insert, traverse, recolor, rotate.

import json

RED = "red"
BLACK = "black"


def emit(event_type, **kwargs):
    event = {"type": event_type}
    event.update(kwargs)
    print(json.dumps(event))


class Node:
    _next_id = 0

    def __init__(self, value, color=RED):
        self.value = value
        self.id = f"n{value}"
        self.color = color
        self.left = None
        self.right = None
        self.parent = None


# ── Edge reconciliation ───────────────────────────────────────────────────

active_edges = set()


def sync_tree(root):
    """Reconcile displayed edges with actual tree structure."""
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

    for eid in list(active_edges):
        if eid not in desired:
            emit("GRAPH_EDGE_REMOVE", edgeId=eid)
            active_edges.discard(eid)

    for eid, (frm, to) in desired.items():
        if eid not in active_edges:
            emit("GRAPH_EDGE_ADD", edgeId=eid, **{"from": frm}, to=to)
            active_edges.add(eid)


class RedBlackTree:
    def __init__(self):
        self.root = None

    def insert(self, value):
        emit("SYSTEM_LOG", level="INFO",
             message=f"── Wstawiam {value} ──")

        new_node = Node(value, RED)
        emit("GRAPH_NODE_ADD", nodeId=new_node.id)
        emit("GRAPH_NODE_HIGHLIGHT", nodeId=new_node.id, status="red")

        # Standard BST insertion with traversal logging
        parent = None
        curr = self.root
        while curr:
            parent = curr
            emit("GRAPH_NODE_HIGHLIGHT", nodeId=curr.id, status="current")
            if value < curr.value:
                emit("SYSTEM_LOG", level="INFO",
                     message=f"{value} < {curr.value} → idę w lewo")
                if curr.left:
                    emit("GRAPH_EDGE_HIGHLIGHT",
                         edgeId=f"e{curr.id}-{curr.left.id}", accepted=True)
                curr = curr.left
            else:
                emit("SYSTEM_LOG", level="INFO",
                     message=f"{value} > {curr.value} → idę w prawo")
                if curr.right:
                    emit("GRAPH_EDGE_HIGHLIGHT",
                         edgeId=f"e{curr.id}-{curr.right.id}", accepted=True)
                curr = curr.right
            emit("GRAPH_NODE_HIGHLIGHT", nodeId=parent.id, status=parent.color)

        new_node.parent = parent
        if parent is None:
            self.root = new_node
        elif value < parent.value:
            parent.left = new_node
        else:
            parent.right = new_node

        sync_tree(self.root)

        emit("SYSTEM_LOG", level="INFO",
             message=f"Węzeł {value} wstawiony jako CZERWONY → sprawdzam właściwości RBT")

        # Fix Red-Black Tree violations
        self.fix_insert(new_node)

    def fix_insert(self, node):
        while node.parent and node.parent.color == RED:
            grandparent = node.parent.parent

            if node.parent == grandparent.left:
                uncle = grandparent.right

                if uncle and uncle.color == RED:
                    # Case 1: Uncle is RED → recolor
                    emit("SYSTEM_LOG", level="WARN",
                         message=f"Case 1: wujek {uncle.value} jest CZERWONY → przekolorowanie")
                    emit("GRAPH_NODE_HIGHLIGHT",
                         nodeId=uncle.id, status="current")

                    node.parent.color = BLACK
                    emit("GRAPH_NODE_HIGHLIGHT",
                         nodeId=node.parent.id, status="black")
                    uncle.color = BLACK
                    emit("GRAPH_NODE_HIGHLIGHT",
                         nodeId=uncle.id, status="black")
                    grandparent.color = RED
                    emit("GRAPH_NODE_HIGHLIGHT",
                         nodeId=grandparent.id, status="red")
                    node = grandparent
                else:
                    if node == node.parent.right:
                        # Case 2: inner child → rotate to align
                        emit("SYSTEM_LOG", level="WARN",
                             message=f"Case 2: węzeł {node.value} jest inner child → rotacja w lewo na {node.parent.value}")
                        node = node.parent
                        self.left_rotate(node)

                    # Case 3: outer child → recolor + rotate
                    emit("SYSTEM_LOG", level="WARN",
                         message=f"Case 3: recolor {node.parent.value}→BLACK, {node.parent.parent.value}→RED + rotacja w prawo")
                    node.parent.color = BLACK
                    emit("GRAPH_NODE_HIGHLIGHT",
                         nodeId=node.parent.id, status="black")
                    node.parent.parent.color = RED
                    emit("GRAPH_NODE_HIGHLIGHT",
                         nodeId=node.parent.parent.id, status="red")
                    self.right_rotate(node.parent.parent)
            else:
                # Mirror: parent is RIGHT child
                uncle = grandparent.left

                if uncle and uncle.color == RED:
                    # Case 1 (mirror)
                    emit("SYSTEM_LOG", level="WARN",
                         message=f"Case 1 (mirror): wujek {uncle.value} jest CZERWONY → przekolorowanie")
                    emit("GRAPH_NODE_HIGHLIGHT",
                         nodeId=uncle.id, status="current")

                    node.parent.color = BLACK
                    emit("GRAPH_NODE_HIGHLIGHT",
                         nodeId=node.parent.id, status="black")
                    uncle.color = BLACK
                    emit("GRAPH_NODE_HIGHLIGHT",
                         nodeId=uncle.id, status="black")
                    grandparent.color = RED
                    emit("GRAPH_NODE_HIGHLIGHT",
                         nodeId=grandparent.id, status="red")
                    node = grandparent
                else:
                    if node == node.parent.left:
                        # Case 2 (mirror)
                        emit("SYSTEM_LOG", level="WARN",
                             message=f"Case 2 (mirror): węzeł {node.value} jest inner child → rotacja w prawo na {node.parent.value}")
                        node = node.parent
                        self.right_rotate(node)

                    # Case 3 (mirror)
                    emit("SYSTEM_LOG", level="WARN",
                         message=f"Case 3 (mirror): recolor {node.parent.value}→BLACK, {node.parent.parent.value}→RED + rotacja w lewo")
                    node.parent.color = BLACK
                    emit("GRAPH_NODE_HIGHLIGHT",
                         nodeId=node.parent.id, status="black")
                    node.parent.parent.color = RED
                    emit("GRAPH_NODE_HIGHLIGHT",
                         nodeId=node.parent.parent.id, status="red")
                    self.left_rotate(node.parent.parent)

        self.root.color = BLACK
        emit("GRAPH_NODE_HIGHLIGHT", nodeId=self.root.id, status="black")

    def left_rotate(self, x):
        y = x.right

        emit("SYSTEM_LOG", level="WARN", message=f"Identyfikacja węzłów: [parent]={x.value} oraz jego PRAWE dziecko [pivot]={y.value}.")
        emit("SYSTEM_LOG", level="WARN", message=f"[pivot] {y.value} WZNOSI SIĘ w górę — przejmuje miejsce węzła [parent] {x.value}.")
        emit("SYSTEM_LOG", level="WARN", message=f"[parent] {x.value} OPADA w dół — staje się LEWYM dzieckiem węzła [pivot] {y.value}.")
        emit("SYSTEM_LOG", level="INFO", message=f"Oryginalne LEWE poddrzewo węzła [pivot] {y.value} zostaje przeniesione i staje się NOWYM PRAWYM dzieckiem węzła [parent] {x.value}.")

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

        emit("GRAPH_NODE_HIGHLIGHT", nodeId=x.id, status="rotate")
        emit("GRAPH_NODE_HIGHLIGHT", nodeId=y.id, status="rotate")
        sync_tree(self.root)
        emit("GRAPH_NODE_HIGHLIGHT", nodeId=x.id, status=x.color)
        emit("GRAPH_NODE_HIGHLIGHT", nodeId=y.id, status=y.color)

    def right_rotate(self, y):
        x = y.left

        emit("SYSTEM_LOG", level="WARN", message=f"Identyfikacja węzłów: [parent]={y.value} oraz jego LEWE dziecko [pivot]={x.value}.")
        emit("SYSTEM_LOG", level="WARN", message=f"[pivot] {x.value} WZNOSI SIĘ w górę — przejmuje miejsce węzła [parent] {y.value}.")
        emit("SYSTEM_LOG", level="WARN", message=f"[parent] {y.value} OPADA w dół — staje się PRAWYM dzieckiem węzła [pivot] {x.value}.")
        emit("SYSTEM_LOG", level="INFO", message=f"Oryginalne PRAWE poddrzewo węzła [pivot] {x.value} zostaje przeniesione i staje się NOWYM LEWYM dzieckiem węzła [parent] {y.value}.")

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

        emit("GRAPH_NODE_HIGHLIGHT", nodeId=x.id, status="rotate")
        emit("GRAPH_NODE_HIGHLIGHT", nodeId=y.id, status="rotate")
        sync_tree(self.root)
        emit("GRAPH_NODE_HIGHLIGHT", nodeId=x.id, status=x.color)
        emit("GRAPH_NODE_HIGHLIGHT", nodeId=y.id, status=y.color)


# ── Static layout for INIT event ──────────────────────────────────────────

def generate_static_layout(arr):
    class SNode:
        def __init__(self, val, nid, col=RED):
            self.val = val
            self.id = nid
            self.col = col
            self.left = None
            self.right = None
            self.parent = None

    def s_left_rotate(root_ref, x):
        y = x.right; x.right = y.left
        if y.left: y.left.parent = x
        y.parent = x.parent
        if not x.parent: root_ref[0] = y
        elif x == x.parent.left: x.parent.left = y
        else: x.parent.right = y
        y.left = x; x.parent = y

    def s_right_rotate(root_ref, y):
        x = y.left; y.left = x.right
        if x.right: x.right.parent = y
        x.parent = y.parent
        if not y.parent: root_ref[0] = x
        elif y == y.parent.right: y.parent.right = x
        else: y.parent.left = x
        x.right = y; y.parent = x

    def s_fix(root_ref, node):
        while node.parent and node.parent.col == RED:
            if node.parent == node.parent.parent.left:
                u = node.parent.parent.right
                if u and u.col == RED:
                    node.parent.col = BLACK; u.col = BLACK
                    node.parent.parent.col = RED
                    node = node.parent.parent
                else:
                    if node == node.parent.right:
                        node = node.parent
                        s_left_rotate(root_ref, node)
                    node.parent.col = BLACK
                    node.parent.parent.col = RED
                    s_right_rotate(root_ref, node.parent.parent)
            else:
                u = node.parent.parent.left
                if u and u.col == RED:
                    node.parent.col = BLACK; u.col = BLACK
                    node.parent.parent.col = RED
                    node = node.parent.parent
                else:
                    if node == node.parent.left:
                        node = node.parent
                        s_right_rotate(root_ref, node)
                    node.parent.col = BLACK
                    node.parent.parent.col = RED
                    s_left_rotate(root_ref, node.parent.parent)
        root_ref[0].col = BLACK

    def s_ins(root_ref, val):
        node = SNode(val, f"n{val}", RED)
        parent = None; curr = root_ref[0]
        while curr:
            parent = curr
            if val < curr.val: curr = curr.left
            else: curr = curr.right
        node.parent = parent
        if not parent: root_ref[0] = node
        elif val < parent.val: parent.left = node
        else: parent.right = node
        s_fix(root_ref, node)

    root_ref = [None]
    for v in arr:
        s_ins(root_ref, v)

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

    traverse(root_ref[0])
    return {"nodes": nodes, "edges": edges,
            "isDirected": True, "layoutHint": "dagre"}


if __name__ == "__main__":
    arr = [30, 15, 70, 10, 20, 60, 85]
    emit("INIT", graph=generate_static_layout(arr))

    emit("SYSTEM_LOG", level="INFO",
         message="Rozpoczynam budowę drzewa czerwono-czarnego.")
    rbt = RedBlackTree()
    for val in arr:
        rbt.insert(val)
