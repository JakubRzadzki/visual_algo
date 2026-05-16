#include <iostream>
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

void dfs_recursive(int u, vector<vector<Edge>>& graph, vector<bool>& visited) {
    visited[u] = true;
    emitNodeHighlight(u);
    emitSystemLog("Visiting node n" + to_string(u));

    for (auto& edge : graph[u]) {
        int v = edge.node;
        emitEdgeHighlight(edge.id, true);
        if (!visited[v]) {
            dfs_recursive(v, graph, visited);
        }
    }
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
    graph[1] = {{3, "e2"}};
    graph[2] = {{4, "e3"}};
    graph[3] = {{4, "e4"}};
    graph[4] = {};

    emitInit(graph);
    vector<bool> visited(5, false);
    dfs_recursive(0, graph, visited);
    emitSystemLog("DFS traversal complete.");
    return 0;
}
