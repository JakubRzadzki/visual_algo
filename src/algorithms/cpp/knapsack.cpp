#include <iostream>
#include <vector>
#include <string>

using namespace std;

void emitLog(const string& message) {
    cout << "{\"type\":\"SYSTEM_LOG\",\"message\":\"" << message << "\",\"level\":\"INFO\"}" << endl;
}

void emitUpdate(int row, int col, int value, const vector<pair<int, int>>& deps) {
    cout << "{\"type\":\"MATRIX_CELL_UPDATE\",\"row\":" << row << ",\"col\":" << col << ",\"value\":" << value << ",\"dependencies\":[";
    for (size_t i = 0; i < deps.size(); ++i) {
        if (i > 0) cout << ",";
        cout << "[" << deps[i].first << "," << deps[i].second << "]";
    }
    cout << "]}" << endl;
}

void emitHighlight(int row, int col, const string& color) {
    cout << "{\"type\":\"MATRIX_CELL_HIGHLIGHT\",\"row\":" << row << ",\"col\":" << col << ",\"color\":\"" << color << "\"}" << endl;
}

int solveKnapsack(const vector<int>& weights, const vector<int>& values, int capacity) {
    int n = weights.size();
    vector<vector<int>> dp(n + 1, vector<int>(capacity + 1, 0));

    emitLog("Initializing 0/1 Knapsack DP table with " + to_string(n) + " items and max capacity W = " + to_string(capacity) + ".");

    for (int i = 0; i <= n; ++i) {
        for (int w = 0; w <= capacity; ++w) {
            if (i == 0 || w == 0) {
                dp[i][w] = 0;
                emitUpdate(i, w, 0, {});
            } else {
                int wt = weights[i - 1];
                int val = values[i - 1];
                if (wt <= w) {
                    int valExcl = dp[i - 1][w];
                    int valIncl = dp[i - 1][w - wt] + val;
                    if (valIncl > valExcl) {
                        dp[i][w] = valIncl;
                        emitUpdate(i, w, valIncl, {{i - 1, w}, {i - 1, w - wt}});
                    } else {
                        dp[i][w] = valExcl;
                        emitUpdate(i, w, valExcl, {{i - 1, w}});
                    }
                } else {
                    dp[i][w] = dp[i - 1][w];
                    emitUpdate(i, w, dp[i][w], {{i - 1, w}});
                }
            }
        }
    }

    emitLog("Knapsack DP completed. Optimal value achieved: " + to_string(dp[n][capacity]) + ".");
    emitHighlight(n, capacity, "#22c55e");
    return dp[n][capacity];
}

int main() {
    vector<int> weights = {1, 3, 4, 2};
    vector<int> values = {15, 20, 30, 10};
    int capacity = 6;
    solveKnapsack(weights, values, capacity);
    return 0;
}
