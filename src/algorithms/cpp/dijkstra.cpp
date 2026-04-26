#include <iostream>
#include <queue>
#include <climits>
#include <vector>
#include <string>

using namespace std;

struct Edge { int node; int weight; string id; };

void emitNodeHighlight(int node, int distance) {
    cout << "{\"type\":\"GRAPH_NODE_HIGHLIGHT\",\"nodeId\":\"n" << node << "\",\"distance\":" << distance << "}" << endl;
}
void emitEdgeHighlight(string edgeId, bool accepted) {
    cout << "{\"type\":\"GRAPH_EDGE_HIGHLIGHT\",\"edgeId\":\"" << edgeId << "\",\"accepted\":" << (accepted ? "true" : "false") << "}" << endl;
}
void emitRelax(string edgeId, int weight) {
    cout << "{\"type\":\"GRAPH_RELAX\",\"edgeId\":\"" << edgeId << "\",\"weight\":" << weight << "}" << endl;
}
void emitSystemLog(string message) {
    cout << "{\"type\":\"SYSTEM_LOG\",\"message\":\"" << message << "\",\"level\":\"INFO\"}" << endl;
}

void dijkstra(int src, vector<vector<Edge>>& graph) {
  int n = graph.size();
  vector<int> dist(n, INT_MAX);
  priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> pq;
  dist[src] = 0;
  pq.push({0, src});
  
  emitNodeHighlight(src, 0);

  while (!pq.empty()) {
    auto [d, u] = pq.top();
    pq.pop();
    if (d > dist[u]) continue;
    for (auto& edge : graph[u]) {
      int v = edge.node;
      int w = edge.weight;
      emitEdgeHighlight(edge.id, true);
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        emitRelax(edge.id, dist[v]);
        emitNodeHighlight(v, dist[v]);
        pq.push({dist[v], v});
      }
    }
  }
  
  string results = "Final shortest paths from n" + to_string(src) + ": ";
  bool first = true;
  int unreachable = 0;
  for (int i = 0; i < n; i++) {
    if (dist[i] != INT_MAX) {
      if (!first) results += ", ";
      results += "n" + to_string(i) + ":" + to_string(dist[i]);
      first = false;
    } else {
      unreachable++;
    }
  }
  
  if (unreachable > 0) {
      emitSystemLog("Warning: " + to_string(unreachable) + " node(s) are unreachable from the source n" + to_string(src) + ".");
  }
  emitSystemLog(results);
}

void emitInit(const vector<vector<Edge>>& graph) {
    cout << "{\"type\":\"INIT\",\"graph\":{\"nodes\":[";
    for (int i = 0; i < (int)graph.size(); i++) {
        if (i > 0) cout << ",";
        cout << "{\"id\":\"n" << i << "\",\"label\":\"" << i << "\",\"x\":" << (i%2)*150-75 << ",\"y\":" << (i/2)*150-75 << "}";
    }
    cout << "],\"edges\":[";
    bool first = true;
    for (int u = 0; u < (int)graph.size(); u++) {
        for (const auto& e : graph[u]) {
            if (!first) cout << ",";
            first = false;
            cout << "{\"id\":\"" << e.id << "\",\"from\":\"n" << u << "\",\"to\":\"n" << e.node << "\",\"weight\":" << e.weight << "}";
        }
    }
    cout << "],\"isDirected\":true}}" << endl;
}

int main() {
    vector<vector<Edge>> graph(4);
    graph[0] = {{1, 4, "e0"}, {2, 1, "e1"}};
    graph[1] = {{3, 1, "e2"}};
    graph[2] = {{1, 2, "e3"}, {3, 5, "e4"}};
    graph[3] = {};

    emitInit(graph);
    dijkstra(0, graph);
    return 0;
}
