import json

def emit(event_type, **kwargs):
    event = {"type": event_type}
    event.update(kwargs)
    print(json.dumps(event))

def dfs(graph, u, visited):
    visited[u] = True
    emit("GRAPH_NODE_HIGHLIGHT", nodeId=f"n{u}", status="current")
    
    for v, w, edge_id in graph[u]:
        emit("GRAPH_EDGE_HIGHLIGHT", edgeId=edge_id, accepted=True, status="path")
        if not visited[v]:
            dfs(graph, v, visited)
            emit("GRAPH_NODE_HIGHLIGHT", nodeId=f"n{u}", status="current")
            emit("GRAPH_EDGE_HIGHLIGHT", edgeId=edge_id, accepted=False, status="backtrack")
        else:
            emit("GRAPH_EDGE_HIGHLIGHT", edgeId=edge_id, accepted=False)
            
    emit("GRAPH_NODE_HIGHLIGHT", nodeId=f"n{u}", status="visited")

if __name__ == "__main__":
    graph = [
        [(1, 1, "e0"), (2, 1, "e1")],
        [(3, 1, "e2"), (4, 1, "e3")],
        [(5, 1, "e4")],
        [],
        [],
        []
    ]
    visited = [False] * len(graph)
    dfs(graph, 0, visited)
