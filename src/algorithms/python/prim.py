import json

def emit(event_type, **kwargs):
    event = {"type": event_type}
    event.update(kwargs)
    print(json.dumps(event))

import heapq

def prim(graph, start_node):
    n = len(graph)
    in_mst = [False] * n
    pq = []
    
    emit("GRAPH_NODE_HIGHLIGHT", nodeId=f"n{start_node}", status="visited")
    in_mst[start_node] = True
    for v, w, edge_id in graph[start_node]:
        heapq.heappush(pq, (w, start_node, v, edge_id))
        
    while pq:
        w, u, v, edge_id = heapq.heappop(pq)
        
        if in_mst[v]:
            emit("GRAPH_EDGE_HIGHLIGHT", edgeId=edge_id, accepted=False)
            continue
            
        emit("GRAPH_EDGE_HIGHLIGHT", edgeId=edge_id, accepted=True)
        emit("GRAPH_NODE_HIGHLIGHT", nodeId=f"n{v}", status="visited")
        in_mst[v] = True
        
        for next_v, next_w, next_edge_id in graph[v]:
            if not in_mst[next_v]:
                heapq.heappush(pq, (next_w, v, next_v, next_edge_id))

if __name__ == "__main__":
    graph = [
        [(1, 2, "e0"), (2, 3, "e3")],
        [(0, 2, "e0"), (3, 1, "e1"), (2, 5, "e4")],
        [(0, 3, "e3"), (1, 5, "e4"), (3, 4, "e2")],
        [(1, 1, "e1"), (2, 4, "e2")]
    ]
    prim(graph, 0)
