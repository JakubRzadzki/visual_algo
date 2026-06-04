/**
 * @file flood-fill.cpp
 * @description C++ implementation of Flood Fill for the sandbox environment.
 * 
 * Time Complexity:  O(V + E)
 * Space Complexity: O(V)
 */

#include <iostream>
#include <vector>
#include <queue>
#include <set>
#include <string>

using namespace std;

/**
 * Sends a visualization event to the backend via stdout.
 */
void push_event(const string& type, const string& payload_json) {
    cout << "{\"type\": \"" << type << "\", " << payload_json << "}" << endl;
}

/**
 * Core Flood Fill Algorithm
 */
void flood_fill(int width, int height, pair<int, int> start, const vector<pair<int, int>>& walls) {
    push_event("SYSTEM_LOG", "\"message\": \"Starting Flood Fill (C++)\", \"level\": \"INFO\"");
    
    set<pair<int, int>> wall_set(walls.begin(), walls.end());
    
    if (wall_set.count(start)) {
        push_event("SYSTEM_LOG", "\"message\": \"Start point is a wall!\", \"level\": \"ERROR\"");
        return;
    }
    
    queue<pair<int, int>> q;
    set<pair<int, int>> visited;
    
    q.push(start);
    visited.insert(start);
    
    // Highlight source
    push_event("MATRIX_CELL_HIGHLIGHT", "\"row\": " + to_string(start.second) + ", \"col\": " + to_string(start.first) + ", \"color\": \"#3b82f6\"");
    
    int filled_count = 0;
    
    while (!q.empty()) {
        pair<int, int> current = q.front();
        q.pop();
        filled_count++;
        
        int dx[] = {0, 1, 0, -1};
        int dy[] = {1, 0, -1, 0};
        
        for (int i = 0; i < 4; i++) {
            pair<int, int> neighbor = {current.first + dx[i], current.second + dy[i]};
            
            if (neighbor.first >= 0 && neighbor.first < width && neighbor.second >= 0 && neighbor.second < height) {
                if (visited.find(neighbor) == visited.end() && wall_set.find(neighbor) == wall_set.end()) {
                    visited.insert(neighbor);
                    q.push(neighbor);
                    
                    push_event("MATRIX_CELL_HIGHLIGHT", "\"row\": " + to_string(neighbor.second) + ", \"col\": " + to_string(neighbor.first) + ", \"color\": \"#0ea5e9\"");
                }
            }
        }
    }
    
    push_event("SYSTEM_LOG", "\"message\": \"Flood fill completed. Filled " + to_string(filled_count) + " cells.\", \"level\": \"INFO\"");
}

int main() {
    int width = 20;
    int height = 20;
    pair<int, int> start = {10, 10};
    vector<pair<int, int>> walls = {};
    
    flood_fill(width, height, start, walls);
    
    return 0;
}
