#include <iostream>
#include <vector>

using namespace std;

void emitCompare(int i, int j) {
    cout << "{\"type\":\"ARRAY_COMPARE\",\"indices\":[" << i << "," << j << "]}" << endl;
}
void emitSet(int index, int value) {
    cout << "{\"type\":\"ARRAY_SET\",\"index\":" << index << ",\"value\":" << value << "}" << endl;
}
void emitInit(const vector<int>& arr) {
    cout << "{\"type\":\"INIT\",\"array\":[";
    for (int i = 0; i < (int)arr.size(); i++) {
        if (i > 0) cout << ",";
        cout << arr[i];
    }
    cout << "]}" << endl;
}

void merge(vector<int>& arr, int l, int m, int r) {
  int n1 = m - l + 1, n2 = r - m;
  vector<int> left(arr.begin() + l, arr.begin() + m + 1);
  vector<int> right(arr.begin() + m + 1, arr.begin() + r + 1);
  int i = 0, j = 0, k = l;
  while (i < n1 && j < n2) {
    emitCompare(l + i, m + 1 + j);
    if (left[i] <= right[j]) {
      emitSet(k, left[i]);
      arr[k++] = left[i++];
    } else {
      emitSet(k, right[j]);
      arr[k++] = right[j++];
    }
  }
  while (i < n1) {
    emitSet(k, left[i]);
    arr[k++] = left[i++];
  }
  while (j < n2) {
    emitSet(k, right[j]);
    arr[k++] = right[j++];
  }
}

void mergeSort(vector<int>& arr, int left, int right) {
  if (left < right) {
    int mid = left + (right - left) / 2;
    mergeSort(arr, left, mid);
    mergeSort(arr, mid + 1, right);
    merge(arr, left, mid, right);
  }
}

int main() {
    vector<int> arr = {38, 27, 43, 3, 9, 82, 10};
    emitInit(arr);
    mergeSort(arr, 0, arr.size() - 1);
    return 0;
}
