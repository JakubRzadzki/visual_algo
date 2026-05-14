#include <iostream>
#include <vector>
#include <queue>
#include <cmath>
#include <map>
#include <set>
#include <string>

using namespace std;

struct Node {
    int x, y;
    int g, f;
    Node* parent;
    
    bool operator>(const Node& other) const {
        return f > other.f;
    }
};

void push_event(string type, string payload_json) {
    cout << "{\"type\": \"" << type << "\", " << payload_json << "}" << endl;
}

int manhattan(int x1, int y1, int x2, int y2) {
    return abs(x1 - x2) + abs(y1 - y2);
}

void a_star(int width, int height, pair<int, int> start, pair<int, int> target) {
    push_event("SYSTEM_LOG", "\"message\": \"Starting A* Search (C++)\", \"level\": \"INFO\"");
    
    priority_queue<Node, vector<Node>, greater<Node>> open_set;
    open_set.push({start.first, start.second, 0, manhattan(start.first, start.second, target.first, target.second), nullptr});
    
    map<pair<int, int>, int> g_score;
    g_score[start] = 0;
    
    map<pair<int, int>, pair<int, int>> came_from;
    set<pair<int, int>> closed_set;
    
    while (!open_set.empty()) {
        Node current = open_set.top();
        open_set.pop();
        
        pair<int, int> curr_p = {current.x, current.y};
        if (closed_set.count(curr_p)) continue;
        closed_set.insert(curr_p);
        
        if (curr_p != start && curr_p != target) {
            string payload = "\"row\": " + to_string(current.y) + ", \"col\": " + to_string(current.x) + ", \"color\": \"#06b6d4\"";
            push_event("MATRIX_CELL_HIGHLIGHT", payload);
            push_event("MATRIX_CELL_UPDATE", payload + ", \"value\": " + to_string(current.f));
        }
        
        if (current.x == target.first && current.y == target.second) {
            push_event("SYSTEM_LOG", "\"message\": \"Target reached!\", \"level\": \"INFO\"");
            return;
        }
        
        int dx[] = {0, 1, 0, -1};
        int dy[] = {1, 0, -1, 0};
        
        for (int i = 0; i < 4; i++) {
            int nx = current.x + dx[i];
            int ny = current.y + dy[i];
            pair<int, int> neighbor = {nx, ny};
            
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                int tentative_g = current.g + 1;
                if (g_score.find(neighbor) == g_score.end() || tentative_g < g_score[neighbor]) {
                    g_score[neighbor] = tentative_g;
                    int f = tentative_g + manhattan(nx, ny, target.first, target.second);
                    open_set.push({nx, ny, tentative_g, f, nullptr});
                    came_from[neighbor] = curr_p;
                }
            }
        }
    }
}

int main() {
    a_star(20, 20, {2, 10}, {17, 10});
    return 0;
}
