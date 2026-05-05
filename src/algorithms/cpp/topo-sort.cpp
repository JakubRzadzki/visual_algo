#include <iostream>
#include <vector>
#include <string>
#include <stack>
#include <algorithm>

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

void topoVisit(int u, vector<vector<Edge>>& graph, vector<bool>& visited, vector<int>& order) {
    visited[u] = true;
    emitNodeHighlight(u);
    for (auto& edge : graph[u]) {
        if (!visited[edge.node]) {
            emitEdgeHighlight(edge.id, true);
            topoVisit(edge.node, graph, visited, order);
        }
    }
    order.push_back(u);
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
    graph[2] = {{3, "e3"}, {4, "e4"}};
    graph[3] = {{4, "e5"}};
    graph[4] = {};

    emitInit(graph);
    vector<bool> visited(5, false);
    vector<int> order;
    for (int i = 0; i < 5; i++) {
        if (!visited[i]) {
            topoVisit(i, graph, visited, order);
        }
    }
    reverse(order.begin(), order.end());
    
    string res = "Topological Order: ";
    for (int i = 0; i < (int)order.size(); i++) {
        if (i > 0) res += " -> ";
        res += "n" + to_string(order[i]);
    }
    emitSystemLog(res);
    return 0;
}
