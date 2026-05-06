// Union-Find (Disjoint Set) with Path Compression and Union by Rank
#include <iostream>
#include <vector>

using namespace std;

class UnionFind {
    vector<int> parent;
    vector<int> rank;

public:
    UnionFind(int n) {
        parent.resize(n);
        rank.resize(n, 0);
        for (int i = 0; i < n; i++)
            parent[i] = i;
    }

    int find(int i) {
        if (parent[i] == i)
            return i;
        return parent[i] = find(parent[i]);
    }

    void unite(int i, int j) {
        int rootI = find(i);
        int rootJ = find(j);
        
        if (rootI != rootJ) {
            if (rank[rootI] < rank[rootJ])
                parent[rootI] = rootJ;
            else if (rank[rootI] > rank[rootJ])
                parent[rootJ] = rootI;
            else {
                parent[rootJ] = rootI;
                rank[rootI]++;
            }
        }
    }
};

int main() {
    vector<int> arr = {0,1, 1,2, 3,4, 4,5, 2,5};
    UnionFind uf(6);
    
    for (size_t i = 0; i < arr.size(); i += 2) {
        uf.unite(arr[i], arr[i+1]);
    }
    
    return 0;
}
