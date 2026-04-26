#include <iostream>
#include <vector>

using namespace std;

void emitCompare(int i, int j) {
    cout << "{\"type\":\"ARRAY_COMPARE\",\"indices\":[" << i << "," << j << "]}" << endl;
}
void emitSwap(int i, int j, int vi, int vj) {
    cout << "{\"type\":\"ARRAY_SWAP\",\"indices\":[" << i << "," << j << "],\"values\":[" << vi << "," << vj << "]}" << endl;
}
void emitInit(const vector<int>& arr) {
    cout << "{\"type\":\"INIT\",\"array\":[";
    for (int i = 0; i < (int)arr.size(); i++) {
        if (i > 0) cout << ",";
        cout << arr[i];
    }
    cout << "]}" << endl;
}

int partition(vector<int>& arr, int low, int high) {
  int pivot = arr[high];
  int i = low - 1;
  for (int j = low; j < high; j++) {
    emitCompare(j, high);
    if (arr[j] < pivot) {
      i++;
      if (i != j) {
        emitSwap(i, j, arr[j], arr[i]);
        swap(arr[i], arr[j]);
      }
    }
  }
  if (i + 1 != high) {
    emitSwap(i + 1, high, arr[high], arr[i + 1]);
    swap(arr[i + 1], arr[high]);
  }
  return i + 1;
}

void quickSort(vector<int>& arr, int low, int high) {
  if (low < high) {
    int pi = partition(arr, low, high);
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
}

int main() {
    vector<int> arr = {29, 10, 14, 37, 14, 25, 1, 31, 9, 22};
    emitInit(arr);
    quickSort(arr, 0, arr.size() - 1);
    return 0;
}
