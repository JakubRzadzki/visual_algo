import heapq
import json


def emit(event_type, **kwargs):
    event = {"type": event_type}
    event.update(kwargs)
    print(json.dumps(event))


def dijkstra(src, graph):
    n = len(graph)
    dist = [float("inf")] * n
    dist[src] = 0
    pq = [(0, src)]

    emit("GRAPH_NODE_HIGHLIGHT", nodeId=f"n{src}", distance=0)

    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue

        for v, w, edge_id in graph[u]:
            emit("GRAPH_EDGE_HIGHLIGHT", edgeId=edge_id, accepted=True)
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                emit("GRAPH_RELAX", edgeId=edge_id, weight=dist[v])
                emit("GRAPH_NODE_HIGHLIGHT", nodeId=f"n{v}", distance=dist[v])
                heapq.heappush(pq, (dist[v], v))
    unreachable = sum(1 for d in dist if d == float("inf"))
    results = [f"n{i}:{d}" for i, d in enumerate(dist) if d != float("inf")]

    if unreachable > 0:
        emit(
            "SYSTEM_LOG",
            message=f"Warning: {unreachable} node(s) are unreachable from the source n{src}.",
            level="WARN",
        )

    emit(
        "SYSTEM_LOG",
        message=f"Final shortest paths from n{src}: " + ", ".join(results),
        level="INFO",
    )
    return dist


def generate_graph_payload(graph_adj):
    nodes = [
        {
            "id": f"n{i}",
            "label": str(i),
            "x": (i % 2) * 150 - 75,
            "y": (i // 2) * 150 - 75,
        }
        for i in range(len(graph_adj))
    ]
    edges = []
    for u in range(len(graph_adj)):
        for v, w, edge_id in graph_adj[u]:
            edges.append({"id": edge_id, "from": f"n{u}", "to": f"n{v}", "weight": w})
    return {"nodes": nodes, "edges": edges, "isDirected": True}


if __name__ == "__main__":
    graph = [
        [(1, 4, "e0"), (2, 1, "e1")],
        [(3, 1, "e2")],
        [(1, 2, "e3"), (3, 5, "e4")],
        [],
    ]
    emit("INIT", graph=generate_graph_payload(graph))
    dijkstra(0, graph)
