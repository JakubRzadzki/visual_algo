#include <iostream>
#include <vector>
#include <string>

using namespace std;

void emit(const string& type, const string& payload) {
    cout << "{\"type\":\"" << type << "\", " << payload << "}" << endl;
}

int linear_search(const vector<int>& arr, int target) {
    for (size_t i = 0; i < arr.size(); ++i) {
        emit("SEARCH_CHECK", "\"index\":" + to_string(i) + ", \"value\":" + to_string(arr[i]) + ", \"target\":" + to_string(target));
        if (arr[i] == target) {
            emit("SEARCH_FOUND", "\"index\":" + to_string(i) + ", \"value\":" + to_string(arr[i]));
            return i;
        }
    }
    emit("SEARCH_NOT_FOUND", "\"target\":" + to_string(target));
    return -1;
}

int main() {
    vector<int> arr = {10, 24, 32, 45, 50, 68, 71, 89};
    int target = 50;
    linear_search(arr, target);
    return 0;
}
