import json

def emit(event_type, **kwargs):
    event = {"type": event_type}
    event.update(kwargs)
    print(json.dumps(event))

def find(parent, x):
    if parent[x] != x:
        parent[x] = find(parent, parent[x])
    return parent[x]

def kruskal(edges, n):
    edges.sort(key=lambda x: x[3])
    parent = list(range(n))
    mst_weight = 0
    
    edges_accepted = 0
    for u, v, edge_id, w in edges:
        pu, pv = find(parent, u), find(parent, v)
        if pu != pv:
            emit("GRAPH_EDGE_HIGHLIGHT", edgeId=edge_id, accepted=True)
            parent[pu] = pv
            mst_weight += w
            edges_accepted += 1
        else:
            emit("GRAPH_EDGE_HIGHLIGHT", edgeId=edge_id, accepted=False)
            
    if edges_accepted < n - 1:
        emit("SYSTEM_LOG", message="MST cannot be formed: the graph is disconnected.", level="WARN")
    else:
        emit("SYSTEM_LOG", message=f"Minimum Spanning Tree found with total weight: {mst_weight}", level="INFO")
    return mst_weight

def generate_graph_payload(nodes, edges):
    payload_nodes = [{"id": f"n{i}", "label": str(i), "x": (i%2)*150 - 75, "y": (i//2)*150 - 75} for i in range(nodes)]
    payload_edges = [{"id": e[2], "from": f"n{e[0]}", "to": f"n{e[1]}", "weight": e[3]} for e in edges]
    return {"nodes": payload_nodes, "edges": payload_edges, "isDirected": False}

if __name__ == "__main__":
    nodes = 5
    edges = [
        (0, 1, "e0", 2),
        (0, 3, "e1", 6),
        (1, 2, "e2", 3),
        (1, 3, "e3", 8),
        (1, 4, "e4", 5),
        (2, 4, "e5", 7),
        (3, 4, "e6", 9)
    ]
    emit("INIT", graph=generate_graph_payload(nodes, edges))
    kruskal(edges, nodes)
