#include <iostream>
#include <queue>
#include <vector>
#include <string>

using namespace std;

struct Edge { int node; string id; };

void emitNodeHighlight(int node) {
    cout << "{\"type\":\"GRAPH_NODE_HIGHLIGHT\",\"nodeId\":\"n" << node << "\"}" << endl;
}
void emitEdgeHighlight(string edgeId, bool accepted) {
    cout << "{\"type\":\"GRAPH_EDGE_HIGHLIGHT\",\"edgeId\":\"" << edgeId << "\",\"accepted\":" << (accepted ? "true" : "false") << "}" << endl;
}
void emitSystemLog(string message) {
    cout << "{\"type\":\"SYSTEM_LOG\",\"message\":\"" << message << "\",\"level\":\"INFO\"}" << endl;
}

void bfs(int src, vector<vector<Edge>>& graph) {
    int n = graph.size();
    vector<bool> visited(n, false);
    queue<int> q;

    visited[src] = true;
    q.push(src);
    emitNodeHighlight(src);
    emitSystemLog("Starting BFS from node n" + to_string(src));

    while (!q.empty()) {
        int u = q.front();
        q.pop();

        for (auto& edge : graph[u]) {
            int v = edge.node;
            emitEdgeHighlight(edge.id, true);
            if (!visited[v]) {
                visited[v] = true;
                emitNodeHighlight(v);
                q.push(v);
            }
        }
    }
    emitSystemLog("BFS traversal complete.");
}

void emitInit(const vector<vector<Edge>>& graph) {
    cout << "{\"type\":\"INIT\",\"graph\":{\"nodes\":[";
    for (int i = 0; i < (int)graph.size(); i++) {
        if (i > 0) cout << ",";
        cout << "{\"id\":\"n" << i << "\",\"label\":\"" << i << "\",\"x\":" << (i%3)*120-120 << ",\"y\":" << (i/3)*120-60 << "}";
    }
    cout << "],\"edges\":[";
    bool first = true;
    for (int u = 0; u < (int)graph.size(); u++) {
        for (const auto& e : graph[u]) {
            if (!first) cout << ",";
            first = false;
            cout << "{\"id\":\"" << e.id << "\",\"from\":\"n" << u << "\",\"to\":\"n" << e.node << "\"}";
        }
    }
    cout << "],\"isDirected\":true}}" << endl;
}

int main() {
    vector<vector<Edge>> graph(5);
    graph[0] = {{1, "e0"}, {2, "e1"}};
    graph[1] = {{3, "e2"}, {4, "e3"}};
    graph[2] = {{4, "e4"}};
    graph[3] = {};
    graph[4] = {};

    emitInit(graph);
    bfs(0, graph);
    return 0;
}
