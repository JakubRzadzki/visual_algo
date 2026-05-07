// Binary Search Tree Insertion
#include <iostream>
#include <vector>
#include <string>

#define EMIT(type, id) std::cout << "{\"type\": \"" << type << "\", \"nodeIds\": [\"" << id << "\"]}\n"

using namespace std;

struct Node {
    int key;
    std::string id;
    Node* left;
    Node* right;
    Node(int item) {
        key = item;
        id = "node-" + std::to_string(item);
        left = right = nullptr;
    }
};

Node* insert(Node* node, int key) {
    if (node == nullptr) {
        EMIT("INSERT", "node-" + std::to_string(key));
        return new Node(key);
    }
    
    EMIT("COMPARE", node->id);
    if (key < node->key)
        node->left = insert(node->left, key);
    else if (key > node->key)
        node->right = insert(node->right, key);
        
    return node;
}

int main() {
    vector<int> arr = {15, 10, 20, 8, 12, 17, 25};
    Node* root = nullptr;
    
    for (int val : arr) {
        root = insert(root, val);
    }
    
    return 0;
}
