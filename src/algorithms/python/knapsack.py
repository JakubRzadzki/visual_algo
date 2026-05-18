import json


def emit(event_type, **kwargs):
    event = {"type": event_type}
    event.update(kwargs)
    print(json.dumps(event))


def solve_knapsack(weights, values, capacity):
    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]

    emit(
        "SYSTEM_LOG",
        message=f"Initializing 0/1 Knapsack DP table with {n} items and max capacity W = {capacity}.",
        level="INFO",
    )

    for i in range(n + 1):
        for w in range(capacity + 1):
            if i == 0 or w == 0:
                dp[i][w] = 0
                emit("MATRIX_CELL_UPDATE", row=i, col=w, value=0, dependencies=[])
            else:
                wt = weights[i - 1]
                val = values[i - 1]
                if wt <= w:
                    val_excl = dp[i - 1][w]
                    val_incl = dp[i - 1][w - wt] + val
                    if val_incl > val_excl:
                        dp[i][w] = val_incl
                        emit(
                            "MATRIX_CELL_UPDATE",
                            row=i,
                            col=w,
                            value=val_incl,
                            dependencies=[[i - 1, w], [i - 1, w - wt]],
                        )
                    else:
                        dp[i][w] = val_excl
                        emit(
                            "MATRIX_CELL_UPDATE",
                            row=i,
                            col=w,
                            value=val_excl,
                            dependencies=[[i - 1, w]],
                        )
                else:
                    dp[i][w] = dp[i - 1][w]
                    emit(
                        "MATRIX_CELL_UPDATE",
                        row=i,
                        col=w,
                        value=dp[i][w],
                        dependencies=[[i - 1, w]],
                    )

    emit(
        "SYSTEM_LOG",
        message=f"Knapsack DP completed. Optimal value achieved: {dp[n][capacity]}.",
        level="INFO",
    )
    emit("MATRIX_CELL_HIGHLIGHT", row=n, col=capacity, color="#22c55e")
    return dp[n][capacity]


if __name__ == "__main__":
    weights = [1, 3, 4, 2]
    values = [15, 20, 30, 10]
    capacity = 6
    solve_knapsack(weights, values, capacity)
