/**
 * @file a-star.cpp
 * @description C++ implementation of A* Search for the sandbox environment.
 * 
 * Time Complexity:  O(E log V)
 * Space Complexity: O(V)
 */

#include <iostream>
#include <vector>
#include <queue>
#include <cmath>
#include <map>
#include <set>
#include <string>
#include <algorithm>

using namespace std;

/**
 * Represents a node in the grid for priority queue.
 */
struct Node {
    int x, y;
    int g, f;
    
    // Min-priority queue needs > operator
    // We want the node with the SMALLEST f-score at the top.
    // If f-scores are equal, we prefer the one with the LARGER g-score (further along).
    bool operator>(const Node& other) const {
        if (f != other.f) return f > other.f;
        return g < other.g;
    }
};

/**
 * Sends a visualization event to the backend via stdout.
 * The backend wraps these into VisualizationEvent objects.
 */
void push_event(const string& type, const string& payload_json) {
    cout << "{\"type\": \"" << type << "\", " << payload_json << "}" << endl;
}

/**
 * Manhattan distance heuristic.
 */
int manhattan(int x1, int y1, int x2, int y2) {
    return abs(x1 - x2) + abs(y1 - y2);
}

/**
 * Core A* Algorithm
 */
void a_star(int width, int height, pair<int, int> start, pair<int, int> target) {
    push_event("SYSTEM_LOG", "\"message\": \"Starting A* Search (C++)\", \"level\": \"INFO\"");
    
    priority_queue<Node, vector<Node>, greater<Node>> open_set;
    open_set.push({start.first, start.second, 0, manhattan(start.first, start.second, target.first, target.second)});
    
    map<pair<int, int>, int> g_score;
    g_score[start] = 0;
    
    map<pair<int, int>, pair<int, int>> came_from;
    set<pair<int, int>> closed_set;
    
    while (!open_set.empty()) {
        Node current = open_set.top();
        open_set.pop();
        
        pair<int, int> curr_pos = {current.x, current.y};
        if (closed_set.count(curr_pos)) continue;
        closed_set.insert(curr_pos);
        
        // Highlight current node being visited (cyan expansion)
        if (curr_pos != start && curr_pos != target) {
            string payload = "\"row\": " + to_string(current.y) + ", \"col\": " + to_string(current.x) + ", \"color\": \"#06b6d4\"";
            push_event("MATRIX_CELL_HIGHLIGHT", payload);
            push_event("MATRIX_CELL_UPDATE", "\"row\": " + to_string(current.y) + ", \"col\": " + to_string(current.x) + ", \"value\": " + to_string(current.f));
        }
        
        // Target reached
        if (current.x == target.first && current.y == target.second) {
            push_event("SYSTEM_LOG", "\"message\": \"Target reached! Reconstructing path...\", \"level\": \"INFO\"");
            
            // Reconstruct path (yellow path)
            pair<int, int> curr = target;
            while (came_from.count(curr)) {
                curr = came_from[curr];
                if (curr == start) break;
                string payload = "\"row\": " + to_string(curr.second) + ", \"col\": " + to_string(curr.first) + ", \"color\": \"#eab308\"";
                push_event("MATRIX_CELL_HIGHLIGHT", payload);
            }
            push_event("SYSTEM_LOG", "\"message\": \"Path reconstruction complete.\", \"level\": \"INFO\"");
            return;
        }
        
        // Neighbors (4-way)
        int dx[] = {0, 1, 0, -1};
        int dy[] = {1, 0, -1, 0};
        
        for (int i = 0; i < 4; i++) {
            int nx = current.x + dx[i];
            int ny = current.y + dy[i];
            
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                pair<int, int> neighbor = {nx, ny};
                int tentative_g = current.g + 1;
                
                if (g_score.find(neighbor) == g_score.end() || tentative_g < g_score[neighbor]) {
                    came_from[neighbor] = curr_pos;
                    g_score[neighbor] = tentative_g;
                    int f = tentative_g + manhattan(nx, ny, target.first, target.second);
                    open_set.push({nx, ny, tentative_g, f});
                    
                    // Note: In A*, we don't usually highlight discovered nodes immediately,
                    // we highlight them when they are extracted from the open set (visited).
                }
            }
        }
    }
    
    push_event("SYSTEM_LOG", "\"message\": \"No path found!\", \"level\": \"ERROR\"");
}

int main() {
    // Standard visualizer grid is 20x20
    // Start at (2, 10), Target at (17, 10)
    a_star(20, 20, {2, 10}, {17, 10});
    return 0;
}

