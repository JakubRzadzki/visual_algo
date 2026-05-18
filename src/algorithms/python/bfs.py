import json


def emit(event_type, **kwargs):
    event = {"type": event_type}
    event.update(kwargs)
    print(json.dumps(event))


from collections import deque


def bfs(graph, start_node):
    n = len(graph)
    visited = [False] * n
    queue = deque([start_node])
    visited[start_node] = True

    emit("GRAPH_NODE_HIGHLIGHT", nodeId=f"n{start_node}", status="start")

    while queue:
        u = queue.popleft()
        emit("GRAPH_NODE_HIGHLIGHT", nodeId=f"n{u}", status="current")

        for v, w, edge_id in graph[u]:
            emit("GRAPH_EDGE_HIGHLIGHT", edgeId=edge_id, accepted=True)
            if not visited[v]:
                visited[v] = True
                emit("GRAPH_NODE_HIGHLIGHT", nodeId=f"n{v}", status="queued")
                queue.append(v)
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
        [],
    ]
    bfs(graph, 0)
