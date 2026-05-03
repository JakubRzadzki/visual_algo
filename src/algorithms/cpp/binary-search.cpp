#include <iostream>
#include <vector>
#include <string>

using namespace std;

void emit(const string& type, const string& payload) {
    cout << "{\"type\":\"" << type << "\", " << payload << "}" << endl;
}

int binary_search(const vector<int>& arr, int target) {
    int left = 0;
    int right = arr.size() - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        emit("SEARCH_NARROW", "\"left\":" + to_string(left) + ", \"right\":" + to_string(right) + ", \"mid\":" + to_string(mid));
        emit("SEARCH_CHECK", "\"index\":" + to_string(mid) + ", \"value\":" + to_string(arr[mid]) + ", \"target\":" + to_string(target));
        
        if (arr[mid] == target) {
            emit("SEARCH_FOUND", "\"index\":" + to_string(mid) + ", \"value\":" + to_string(arr[mid]));
            return mid;
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    emit("SEARCH_NOT_FOUND", "\"target\":" + to_string(target));
    return -1;
}

int main() {
    vector<int> arr = {3, 9, 10, 27, 38, 43, 82};
    int target = 38;
    binary_search(arr, target);
    return 0;
}
