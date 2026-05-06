// Max Heap Insertion
#include <iostream>
#include <vector>

using namespace std;

void insert(vector<int>& heap, int val) {
    heap.push_back(val);
    int curr = heap.size() - 1;
    
    // Sift up
    while (curr > 0) {
        int parent = (curr - 1) / 2;
        if (heap[curr] > heap[parent]) {
            swap(heap[curr], heap[parent]);
            curr = parent;
        } else {
            break;
        }
    }
}

int main() {
    vector<int> arr = {15, 30, 20, 45, 10, 50};
    vector<int> heap;
    
    for (int val : arr) {
        insert(heap, val);
    }
    
    return 0;
}
