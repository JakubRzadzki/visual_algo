#include <iostream>
#include <algorithm>
#include <numeric>
#include <vector>
#include <string>

using namespace std;

struct Edge { int u, v, w; string id; };
bool cmp(Edge a, Edge b) { return a.w < b.w; }

void emitEdgeHighlight(string edgeId, bool accepted) {
    cout << "{\"type\":\"GRAPH_EDGE_HIGHLIGHT\",\"edgeId\":\"" << edgeId << "\",\"accepted\":" << (accepted ? "true" : "false") << "}" << endl;
}
void emitSystemLog(string message) {
    cout << "{\"type\":\"SYSTEM_LOG\",\"message\":\"" << message << "\",\"level\":\"INFO\"}" << endl;
}

int findSet(vector<int>& parent, int x) {
  if (parent[x] != x)
    parent[x] = findSet(parent, parent[x]);
  return parent[x];
}

void kruskal(vector<Edge>& edges, int n) {
  sort(edges.begin(), edges.end(), cmp);
  vector<int> parent(n);
  iota(parent.begin(), parent.end(), 0);
  int mst_weight = 0;
  int edges_accepted = 0;
  for (auto& e : edges) {
    int pu = findSet(parent, e.u);
    int pv = findSet(parent, e.v);
    if (pu != pv) {
      emitEdgeHighlight(e.id, true);
      parent[pu] = pv;
      mst_weight += e.w;
      edges_accepted++;
    } else {
      emitEdgeHighlight(e.id, false);
    }
  }
  
  if (edges_accepted < n - 1) {
      emitSystemLog("MST cannot be formed: the graph is disconnected.");
  } else {
      emitSystemLog("Minimum Spanning Tree found with total weight: " + to_string(mst_weight));
  }
}

void emitInit(int nodes, const vector<Edge>& edges) {
    cout << "{\"type\":\"INIT\",\"graph\":{\"nodes\":[";
    for (int i = 0; i < nodes; i++) {
        if (i > 0) cout << ",";
        cout << "{\"id\":\"n" << i << "\",\"label\":\"" << i << "\",\"x\":" << (i%2)*150-75 << ",\"y\":" << (i/2)*150-75 << "}";
    }
    cout << "],\"edges\":[";
    bool first = true;
    for (const auto& e : edges) {
        if (!first) cout << ",";
        first = false;
        cout << "{\"id\":\"" << e.id << "\",\"from\":\"n" << e.u << "\",\"to\":\"n" << e.v << "\",\"weight\":" << e.w << "}";
    }
    cout << "],\"isDirected\":false}}" << endl;
}

int main() {
    int nodes = 5;
    vector<Edge> edges = {
        {0, 1, 2, "e0"},
        {0, 3, 6, "e1"},
        {1, 2, 3, "e2"},
        {1, 3, 8, "e3"},
        {1, 4, 5, "e4"},
        {2, 4, 7, "e5"},
        {3, 4, 9, "e6"}
    };
    emitInit(nodes, edges);
    kruskal(edges, nodes);
    return 0;
}
