#include <iostream>
#include <vector>
#include <queue>
#include <string>
#include <climits>

using namespace std;

struct Edge { int node; int weight; string id; };

void emitNodeHighlight(int node, int key) {
    cout << "{\"type\":\"GRAPH_NODE_HIGHLIGHT\",\"nodeId\":\"n" << node << "\",\"key\":" << key << "}" << endl;
}
void emitEdgeHighlight(string edgeId, bool accepted) {
    cout << "{\"type\":\"GRAPH_EDGE_HIGHLIGHT\",\"edgeId\":\"" << edgeId << "\",\"accepted\":" << (accepted ? "true" : "false") << "}" << endl;
}
void emitSystemLog(string message) {
    cout << "{\"type\":\"SYSTEM_LOG\",\"message\":\"" << message << "\",\"level\":\"INFO\"}" << endl;
}

void prim(int n, vector<vector<Edge>>& graph) {
    vector<int> key(n, INT_MAX);
    vector<bool> inMST(n, false);
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;

    key[0] = 0;
    pq.push({0, 0});
    emitNodeHighlight(0, 0);

    while (!pq.empty()) {
        int u = pq.top().second;
        pq.pop();

        if (inMST[u]) continue;
        inMST[u] = true;
        emitNodeHighlight(u, key[u]);
        emitSystemLog("Adding node n" + to_string(u) + " to MST");

        for (auto& edge : graph[u]) {
            int v = edge.node;
            int weight = edge.weight;
            if (!inMST[v] && weight < key[v]) {
                key[v] = weight;
                pq.push({key[v], v});
                emitEdgeHighlight(edge.id, true);
                emitNodeHighlight(v, key[v]);
            }
        }
    }
    emitSystemLog("Prim's MST algorithm complete.");
}

void emitInit(int n, const vector<vector<Edge>>& graph) {
    cout << "{\"type\":\"INIT\",\"graph\":{\"nodes\":[";
    for (int i = 0; i < n; i++) {
        if (i > 0) cout << ",";
        cout << "{\"id\":\"n" << i << "\",\"label\":\"" << i << "\",\"x\":" << (i%2)*150-75 << ",\"y\":" << (i/2)*150-75 << "}";
    }
    cout << "],\"edges\":[";
    bool first = true;
    for (int u = 0; u < n; u++) {
        for (const auto& e : graph[u]) {
            if (u < e.node) { // Only emit once for undirected
                if (!first) cout << ",";
                first = false;
                cout << "{\"id\":\"" << e.id << "\",\"from\":\"n" << u << "\",\"to\":\"n" << e.node << "\",\"weight\":" << e.weight << "}";
            }
        }
    }
    cout << "],\"isDirected\":false}}" << endl;
}

int main() {
    int n = 5;
    vector<vector<Edge>> graph(n);
    graph[0] = {{1, 2, "e0"}, {3, 6, "e1"}};
    graph[1] = {{0, 2, "e0"}, {2, 3, "e2"}, {3, 8, "e3"}, {4, 5, "e4"}};
    graph[2] = {{1, 3, "e2"}, {4, 7, "e5"}};
    graph[3] = {{0, 6, "e1"}, {1, 8, "e3"}, {4, 9, "e6"}};
    graph[4] = {{1, 5, "e4"}, {2, 7, "e5"}, {3, 9, "e6"}};

    emitInit(n, graph);
    prim(n, graph);
    return 0;
}
