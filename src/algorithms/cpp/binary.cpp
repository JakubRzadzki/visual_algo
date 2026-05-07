// Binary Tree Node Definition and Traversals in C++
#include <iostream>
#include <vector>
#include <string>

// Simple emit macro to prevent empty trace errors in sandbox
#define EMIT(type, id) std::cout << "{\"type\": \"" << type << "\", \"nodeIds\": [\"" << id << "\"]}\n"

struct Node {
    std::string value;
    std::string id;
    Node* left;
    Node* right;

    Node(std::string val, std::string nid) : value(val), id(nid), left(nullptr), right(nullptr) {}
};

void inorder(Node* root, std::vector<std::string>& path) {
    if (!root) return;
    inorder(root->left, path);
    EMIT("VISIT", root->id);
    path.push_back(root->value);
    inorder(root->right, path);
}

void preorder(Node* root, std::vector<std::string>& path) {
    if (!root) return;
    EMIT("VISIT", root->id);
    path.push_back(root->value);
    preorder(root->left, path);
    preorder(root->right, path);
}

void postorder(Node* root, std::vector<std::string>& path) {
    if (!root) return;
    postorder(root->left, path);
    postorder(root->right, path);
    EMIT("VISIT", root->id);
    path.push_back(root->value);
}

int main() {
    Node* root = new Node("+", "node-root");
    root->left = new Node("A", "node-A");
    root->right = new Node("*", "node-mul");
    root->right->left = new Node("B", "node-B");
    root->right->right = new Node("C", "node-C");

    std::vector<std::string> path;
    preorder(root, path);
    inorder(root, path);
    postorder(root, path);
    
    return 0;
}
