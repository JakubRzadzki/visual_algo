import json

def emit(event_type, **kwargs):
    event = {"type": event_type}
    event.update(kwargs)
    print(json.dumps(event))

from collections import deque

def topo_sort(graph):
    n = len(graph)
    in_degree = [0] * n
    
    # Calculate in-degrees
    for u in range(n):
        for v, w, edge_id in graph[u]:
            in_degree[v] += 1
            
    queue = deque()
    for i in range(n):
        if in_degree[i] == 0:
            queue.append(i)
            emit("GRAPH_NODE_HIGHLIGHT", nodeId=f"n{i}", status="queued")
            
    result = []
    
    while queue:
        u = queue.popleft()
        emit("GRAPH_NODE_HIGHLIGHT", nodeId=f"n{u}", status="current")
        result.append(u)
        
        for v, w, edge_id in graph[u]:
            emit("GRAPH_EDGE_HIGHLIGHT", edgeId=edge_id, accepted=True)
            in_degree[v] -= 1
            if in_degree[v] == 0:
                queue.append(v)
                emit("GRAPH_NODE_HIGHLIGHT", nodeId=f"n{v}", status="queued")
                
        emit("GRAPH_NODE_HIGHLIGHT", nodeId=f"n{u}", status="removed")
        
    if len(result) != n:
        emit("SYSTEM_LOG", message="Graph has a cycle! Topological sort not possible.", level="WARN")
    else:
        emit("SYSTEM_LOG", message=f"Topological Sort order: {result}", level="INFO")

if __name__ == "__main__":
    graph = [
        [(1, 1, "e0"), (2, 1, "e1")],
        [(3, 1, "e2")],
        [(3, 1, "e3")],
        []
    ]
    topo_sort(graph)
