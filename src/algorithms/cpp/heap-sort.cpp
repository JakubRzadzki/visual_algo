#include <iostream>
#include <vector>
#include <string>

using namespace std;

void emit(const string& type, const string& payload) {
    cout << "{\"type\":\"" << type << "\", " << payload << "}" << endl;
}

void heapify(vector<int>& arr, int n, int i) {
    int largest = i;
    int l = 2 * i + 1;
    int r = 2 * i + 2;

    if (l < n) {
        emit("ARRAY_COMPARE", "\"indices\":[" + to_string(l) + "," + to_string(largest) + "]");
        if (arr[l] > arr[largest]) largest = l;
    }

    if (r < n) {
        emit("ARRAY_COMPARE", "\"indices\":[" + to_string(r) + "," + to_string(largest) + "]");
        if (arr[r] > arr[largest]) largest = r;
    }

    if (largest != i) {
        int temp = arr[i];
        arr[i] = arr[largest];
        arr[largest] = temp;
        emit("ARRAY_SWAP", "\"indices\":[" + to_string(i) + "," + to_string(largest) + "], \"values\":[" + to_string(arr[i]) + "," + to_string(arr[largest]) + "]");
        heapify(arr, n, largest);
    }
}

void heap_sort(vector<int>& arr) {
    int n = arr.size();
    for (int i = n / 2 - 1; i >= 0; i--) {
        heapify(arr, n, i);
    }

    for (int i = n - 1; i > 0; i--) {
        int temp = arr[0];
        arr[0] = arr[i];
        arr[i] = temp;
        emit("ARRAY_SWAP", "\"indices\":[0," + to_string(i) + "], \"values\":[" + to_string(arr[0]) + "," + to_string(arr[i]) + "]");
        heapify(arr, i, 0);
    }
}

int main() {
    vector<int> arr = {12, 11, 13, 5, 6, 7};
    heap_sort(arr);
    return 0;
}
