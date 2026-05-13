#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

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

int solveLCS(const string& text1, const string& text2) {
    int m = text1.size();
    int n = text2.size();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));

    emitLog("Initializing Longest Common Subsequence matrix for sequences '" + text1 + "' and '" + text2 + "'.");

    for (int i = 0; i <= m; ++i) {
        for (int j = 0; j <= n; ++j) {
            if (i == 0 || j == 0) {
                dp[i][j] = 0;
                emitUpdate(i, j, 0, {});
            } else {
                if (text1[i - 1] == text2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                    emitUpdate(i, j, dp[i][j], {{i - 1, j - 1}});
                } else {
                    int opt1 = dp[i - 1][j];
                    int opt2 = dp[i][j - 1];
                    dp[i][j] = max(opt1, opt2);
                    emitUpdate(i, j, dp[i][j], {{i - 1, j}, {i, j - 1}});
                }
            }
        }
    }

    emitLog("LCS Computation complete. Length of Longest Common Subsequence is " + to_string(dp[m][n]) + ".");
    emitHighlight(m, n, "#22c55e");
    return dp[m][n];
}

int main() {
    string text1 = "ABCBDAB";
    string text2 = "BDCAB";
    solveLCS(text1, text2);
    return 0;
}
