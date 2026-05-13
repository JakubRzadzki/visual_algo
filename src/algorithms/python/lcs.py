import json

def emit(event_type, **kwargs):
    event = {"type": event_type}
    event.update(kwargs)
    print(json.dumps(event))

def solve_lcs(text1, text2):
    m = len(text1)
    n = len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    emit("SYSTEM_LOG", message=f"Initializing Longest Common Subsequence matrix for sequences '{text1}' and '{text2}'.", level="INFO")

    for i in range(m + 1):
        for j in range(n + 1):
            if i == 0 or j == 0:
                dp[i][j] = 0
                emit("MATRIX_CELL_UPDATE", row=i, col=j, value=0, dependencies=[])
            else:
                if text1[i - 1] == text2[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1] + 1
                    emit("MATRIX_CELL_UPDATE", row=i, col=j, value=dp[i][j], dependencies=[[i - 1, j - 1]])
                else:
                    opt1 = dp[i - 1][j]
                    opt2 = dp[i][j - 1]
                    dp[i][j] = max(opt1, opt2)
                    emit("MATRIX_CELL_UPDATE", row=i, col=j, value=dp[i][j], dependencies=[[i - 1, j], [i, j - 1]])

    emit("SYSTEM_LOG", message=f"LCS Computation complete. Length of Longest Common Subsequence is {dp[m][n]}.", level="INFO")
    emit("MATRIX_CELL_HIGHLIGHT", row=m, col=n, color="#22c55e")
    return dp[m][n]

if __name__ == "__main__":
    text1 = "ABCBDAB"
    text2 = "BDCAB"
    solve_lcs(text1, text2)
