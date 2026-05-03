#include <iostream>
#include <vector>
#include <string>

using namespace std;

void emit(const string& type, const string& payload) {
    cout << "{\"type\":\"" << type << "\", " << payload << "}" << endl;
}

void bubble_sort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; ++i) {
        bool swapped = false;
        for (int j = 0; j < n - i - 1; ++j) {
            emit("ARRAY_COMPARE", "\"indices\":[" + to_string(j) + "," + to_string(j+1) + "]");
            if (arr[j] > arr[j+1]) {
                int temp = arr[j];
                arr[j] = arr[j+1];
                arr[j+1] = temp;
                emit("ARRAY_SWAP", "\"indices\":[" + to_string(j) + "," + to_string(j+1) + "], \"values\":[" + to_string(arr[j]) + "," + to_string(arr[j+1]) + "]");
                swapped = true;
            }
        }
        if (!swapped) break;
    }
}

int main() {
    vector<int> arr = {64, 34, 25, 12, 22, 11, 90};
    bubble_sort(arr);
    return 0;
}
