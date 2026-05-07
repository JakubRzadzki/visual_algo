// Red-Black Tree Node Insertion and Balancing in C++
// Implements a self-balancing binary search tree with node coloring (Red/Black).

#include <iostream>

enum Color { RED, BLACK };

struct Node {
    int value;
    Color color;
    Node* left;
    Node* right;
    Node* parent;

    Node(int val, Color col = RED) : value(val), color(col), left(nullptr), right(nullptr), parent(nullptr) {}
};

class RedBlackTree {
private:
    Node* root;

    void leftRotate(Node* x) {
        Node* y = x->right;
        x->right = y->left;
        if (y->left) y->left->parent = x;
        y->parent = x->parent;
        if (!x->parent) root = y;
        else if (x == x->parent->left) x->parent->left = y;
        else x->parent->right = y;
        y->left = x;
        x->parent = y;
    }

    void rightRotate(Node* y) {
        Node* x = y->left;
        y->left = x->right;
        if (x->right) x->right->parent = y;
        x->parent = y->parent;
        if (!y->parent) root = x;
        else if (y == y->parent->right) y->parent->right = x;
        else y->parent->left = x;
        x->right = y;
        y->parent = x;
    }

public:
    RedBlackTree() : root(nullptr) {}

    void insert(int val) {
        Node* node = new Node(val, RED);
        Node* parent = nullptr;
        Node* curr = root;

        while (curr) {
            parent = curr;
            if (val < curr->value) curr = curr->left;
            else curr = curr->right;
        }

        node->parent = parent;
        if (!parent) root = node;
        else if (val < parent->value) parent->left = node;
        else parent->right = node;

        fixInsert(node);
    }

    void fixInsert(Node* node) {
        while (node->parent && node->parent->color == RED) {
            if (node->parent == node->parent->parent->left) {
                Node* uncle = node->parent->parent->right;
                if (uncle && uncle->color == RED) {
                    node->parent->color = BLACK;
                    uncle->color = BLACK;
                    node->parent->parent->color = RED;
                    node = node->parent->parent;
                } else {
                    if (node == node->parent->right) {
                        node = node->parent;
                        leftRotate(node);
                    }
                    node->parent->color = BLACK;
                    node->parent->parent->color = RED;
                    rightRotate(node->parent->parent);
                }
            } else {
                Node* uncle = node->parent->parent->left;
                if (uncle && uncle->color == RED) {
                    node->parent->color = BLACK;
                    uncle->color = BLACK;
                    node->parent->parent->color = RED;
                    node = node->parent->parent;
                } else {
                    if (node == node->parent->left) {
                        node = node->parent;
                        rightRotate(node);
                    }
                    node->parent->color = BLACK;
                    node->parent->parent->color = RED;
                    leftRotate(node->parent->parent);
                }
            }
        }
        root->color = BLACK;
    }
};

int main() {
    RedBlackTree rbt;
    rbt.insert(30);
    rbt.insert(15);
    rbt.insert(70);
    std::cout << "Red-Black Tree insertion completed." << std::endl;
    return 0;
}
