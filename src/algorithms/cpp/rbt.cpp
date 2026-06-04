#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <set>
#include <map>
#include <functional>

using namespace std;

void push_event(const string& type, const string& payload_json) {
    cout << "{\"type\": \"" << type << "\", " << payload_json << "}" << endl;
}

// ── RBT Node ──────────────────────────────────────────────────────────────

enum Color { RED, BLACK };

struct Node {
    int value;
    string id;
    Color color;
    Node* left;
    Node* right;
    Node* parent;

    Node(int val, const string& id, Color col = RED) : value(val), id(id), color(col), left(nullptr), right(nullptr), parent(nullptr) {}
};

// ── Edge reconciliation ──────────────────────────────────────────────────

set<string> active_edges;

void sync_tree(Node* root) {
    map<string, pair<string,string>> desired;

    function<void(Node*)> walk = [&](Node* n) {
        if (!n) return;
        if (n->left) {
            string eid = "e" + n->id + "-" + n->left->id;
            desired[eid] = {n->id, n->left->id};
            walk(n->left);
        }
        if (n->right) {
            string eid = "e" + n->id + "-" + n->right->id;
            desired[eid] = {n->id, n->right->id};
            walk(n->right);
        }
    };
    walk(root);

    vector<string> to_remove;
    for (const auto& eid : active_edges) {
        if (desired.find(eid) == desired.end()) {
            push_event("GRAPH_EDGE_REMOVE", "\"edgeId\": \"" + eid + "\"");
            to_remove.push_back(eid);
        }
    }
    for (const auto& eid : to_remove) active_edges.erase(eid);

    for (const auto& [eid, endpoints] : desired) {
        if (active_edges.find(eid) == active_edges.end()) {
            push_event("GRAPH_EDGE_ADD",
                "\"edgeId\": \"" + eid + "\", \"from\": \"" + endpoints.first +
                "\", \"to\": \"" + endpoints.second + "\"");
            active_edges.insert(eid);
        }
    }
}

// ── Red-Black Tree ───────────────────────────────────────────────────────

class RedBlackTree {
private:
    Node* root;

    void leftRotate(Node* x) {
        Node* y = x->right;

        push_event("SYSTEM_LOG", "\"level\": \"WARN\", \"message\": \"Identyfikacja węzłów: [parent]=" + to_string(x->value) + " oraz jego PRAWE dziecko [pivot]=" + to_string(y->value) + ".\"");
        push_event("SYSTEM_LOG", "\"level\": \"WARN\", \"message\": \"[pivot] " + to_string(y->value) + " WZNOSI SIĘ w górę — przejmuje miejsce węzła [parent] " + to_string(x->value) + ".\"");
        push_event("SYSTEM_LOG", "\"level\": \"WARN\", \"message\": \"[parent] " + to_string(x->value) + " OPADA w dół — staje się LEWYM dzieckiem węzła [pivot] " + to_string(y->value) + ".\"");
        push_event("SYSTEM_LOG", "\"level\": \"INFO\", \"message\": \"Oryginalne LEWE poddrzewo węzła [pivot] " + to_string(y->value) + " zostaje przeniesione i staje się NOWYM PRAWYM dzieckiem węzła [parent] " + to_string(x->value) + ".\"");

        x->right = y->left;
        if (y->left) y->left->parent = x;
        y->parent = x->parent;
        if (!x->parent) root = y;
        else if (x == x->parent->left) x->parent->left = y;
        else x->parent->right = y;
        y->left = x;
        x->parent = y;

        push_event("GRAPH_NODE_HIGHLIGHT", "\"nodeId\": \"" + x->id + "\", \"status\": \"rotate\"");
        push_event("GRAPH_NODE_HIGHLIGHT", "\"nodeId\": \"" + y->id + "\", \"status\": \"rotate\"");
        sync_tree(root);
        push_event("GRAPH_NODE_HIGHLIGHT", "\"nodeId\": \"" + x->id + "\", \"status\": \"" + x->color + "\"");
        push_event("GRAPH_NODE_HIGHLIGHT", "\"nodeId\": \"" + y->id + "\", \"status\": \"" + y->color + "\"");
    }

    void rightRotate(Node* y) {
        Node* x = y->left;

        push_event("SYSTEM_LOG", "\"level\": \"WARN\", \"message\": \"Identyfikacja węzłów: [parent]=" + to_string(y->value) + " oraz jego LEWE dziecko [pivot]=" + to_string(x->value) + ".\"");
        push_event("SYSTEM_LOG", "\"level\": \"WARN\", \"message\": \"[pivot] " + to_string(x->value) + " WZNOSI SIĘ w górę — przejmuje miejsce węzła [parent] " + to_string(y->value) + ".\"");
        push_event("SYSTEM_LOG", "\"level\": \"WARN\", \"message\": \"[parent] " + to_string(y->value) + " OPADA w dół — staje się PRAWYM dzieckiem węzła [pivot] " + to_string(x->value) + ".\"");
        push_event("SYSTEM_LOG", "\"level\": \"INFO\", \"message\": \"Oryginalne PRAWE poddrzewo węzła [pivot] " + to_string(x->value) + " zostaje przeniesione i staje się NOWYM LEWYM dzieckiem węzła [parent] " + to_string(y->value) + ".\"");

        y->left = x->right;
        if (x->right) x->right->parent = y;
        x->parent = y->parent;
        if (!y->parent) root = x;
        else if (y == y->parent->right) y->parent->right = x;
        else y->parent->left = x;
        x->right = y;
        y->parent = x;

        push_event("GRAPH_NODE_HIGHLIGHT", "\"nodeId\": \"" + x->id + "\", \"status\": \"rotate\"");
        push_event("GRAPH_NODE_HIGHLIGHT", "\"nodeId\": \"" + y->id + "\", \"status\": \"rotate\"");
        sync_tree(root);
        push_event("GRAPH_NODE_HIGHLIGHT", "\"nodeId\": \"" + x->id + "\", \"status\": \"" + x->color + "\"");
        push_event("GRAPH_NODE_HIGHLIGHT", "\"nodeId\": \"" + y->id + "\", \"status\": \"" + y->color + "\"");
    }

public:
    RedBlackTree() : root(nullptr) {}

    void insert(int val) {
        push_event("SYSTEM_LOG", "\"level\": \"INFO\", \"message\": \"── Wstawiam " + to_string(val) + " ──\"");
        string node_id = "n" + to_string(val);
        push_event("GRAPH_NODE_ADD", "\"nodeId\": \"" + node_id + "\"");
        push_event("GRAPH_NODE_HIGHLIGHT", "\"nodeId\": \"" + node_id + "\", \"status\": \"red\"");

        Node* node = new Node(val, node_id, RED);
        Node* parent = nullptr;
        Node* curr = root;

        while (curr) {
            push_event("GRAPH_NODE_HIGHLIGHT", "\"nodeId\": \"" + curr->id + "\", \"status\": \"current\"");
            parent = curr;
            if (val < curr->value) {
                push_event("SYSTEM_LOG", "\"level\": \"INFO\", \"message\": \"" +
                    to_string(val) + " < " + to_string(curr->value) + " → idę w lewo\"");
                if (curr->left) push_event("GRAPH_EDGE_HIGHLIGHT", "\"edgeId\": \"e" + curr->id + "-" + curr->left->id + "\", \"accepted\": true");
                curr = curr->left;
            } else {
                push_event("SYSTEM_LOG", "\"level\": \"INFO\", \"message\": \"" +
                    to_string(val) + " > " + to_string(curr->value) + " → idę w prawo\"");
                if (curr->right) push_event("GRAPH_EDGE_HIGHLIGHT", "\"edgeId\": \"e" + curr->id + "-" + curr->right->id + "\", \"accepted\": true");
                curr = curr->right;
            }
            push_event("GRAPH_NODE_HIGHLIGHT", "\"nodeId\": \"" + parent->id + "\", \"status\": \"" + parent->color + "\"");
        }

        node->parent = parent;
        if (!parent) {
            root = node;
        } else if (val < parent->value) {
            parent->left = node;
        } else {
            parent->right = node;
        }

        sync_tree(root);

        push_event("SYSTEM_LOG", "\"level\": \"INFO\", \"message\": \"Węzeł " + to_string(val) + " wstawiony jako CZERWONY → sprawdzam właściwości RBT\"");

        fixInsert(node);
    }

    void fixInsert(Node* node) {
        while (node->parent && node->parent->color == RED) {
            Node* grandparent = node->parent->parent;

            if (node->parent == grandparent->left) {
                Node* uncle = grandparent->right;

                if (uncle && uncle->color == RED) {
                    // Case 1: Uncle RED → recolor
                    push_event("SYSTEM_LOG", "\"level\": \"WARN\", \"message\": \"Case 1: wujek " +
                        to_string(uncle->value) + " jest CZERWONY → przekolorowanie\"");
                    push_event("GRAPH_NODE_HIGHLIGHT", "\"nodeId\": \"" + uncle->id + "\", \"status\": \"current\"");

                    node->parent->color = BLACK;
                    push_event("GRAPH_NODE_HIGHLIGHT", "\"nodeId\": \"" + node->parent->id + "\", \"status\": \"black\"");
                    uncle->color = BLACK;
                    push_event("GRAPH_NODE_HIGHLIGHT", "\"nodeId\": \"" + uncle->id + "\", \"status\": \"black\"");
                    grandparent->color = RED;
                    push_event("GRAPH_NODE_HIGHLIGHT", "\"nodeId\": \"" + grandparent->id + "\", \"status\": \"red\"");
                    node = grandparent;
                } else {
                    if (node == node->parent->right) {
                        // Case 2: inner child → rotate to align
                        push_event("SYSTEM_LOG", "\"level\": \"WARN\", \"message\": \"Case 2: węzeł " +
                            to_string(node->value) + " jest inner child → rotacja w lewo na " + to_string(node->parent->value) + "\"");
                        node = node->parent;
                        leftRotate(node);
                    }
                    // Case 3: outer child → recolor + rotate
                    push_event("SYSTEM_LOG", "\"level\": \"WARN\", \"message\": \"Case 3: recolor " +
                        to_string(node->parent->value) + "→BLACK, " + to_string(node->parent->parent->value) + "→RED + rotacja w prawo\"");
                    node->parent->color = BLACK;
                    push_event("GRAPH_NODE_HIGHLIGHT", "\"nodeId\": \"" + node->parent->id + "\", \"status\": \"black\"");
                    node->parent->parent->color = RED;
                    push_event("GRAPH_NODE_HIGHLIGHT", "\"nodeId\": \"" + node->parent->parent->id + "\", \"status\": \"red\"");
                    rightRotate(node->parent->parent);
                }
            } else {
                // Mirror: parent is RIGHT child
                Node* uncle = grandparent->left;

                if (uncle && uncle->color == RED) {
                    // Case 1 (mirror)
                    push_event("SYSTEM_LOG", "\"level\": \"WARN\", \"message\": \"Case 1 (mirror): wujek " +
                        to_string(uncle->value) + " jest CZERWONY → przekolorowanie\"");
                    push_event("GRAPH_NODE_HIGHLIGHT", "\"nodeId\": \"" + uncle->id + "\", \"status\": \"current\"");

                    node->parent->color = BLACK;
                    push_event("GRAPH_NODE_HIGHLIGHT", "\"nodeId\": \"" + node->parent->id + "\", \"status\": \"black\"");
                    uncle->color = BLACK;
                    push_event("GRAPH_NODE_HIGHLIGHT", "\"nodeId\": \"" + uncle->id + "\", \"status\": \"black\"");
                    grandparent->color = RED;
                    push_event("GRAPH_NODE_HIGHLIGHT", "\"nodeId\": \"" + grandparent->id + "\", \"status\": \"red\"");
                    node = grandparent;
                } else {
                    if (node == node->parent->left) {
                        // Case 2 (mirror)
                        push_event("SYSTEM_LOG", "\"level\": \"WARN\", \"message\": \"Case 2 (mirror): węzeł " +
                            to_string(node->value) + " jest inner child → rotacja w prawo na " + to_string(node->parent->value) + "\"");
                        node = node->parent;
                        rightRotate(node);
                    }
                    // Case 3 (mirror)
                    push_event("SYSTEM_LOG", "\"level\": \"WARN\", \"message\": \"Case 3 (mirror): recolor " +
                        to_string(node->parent->value) + "→BLACK, " + to_string(node->parent->parent->value) + "→RED + rotacja w lewo\"");
                    node->parent->color = BLACK;
                    push_event("GRAPH_NODE_HIGHLIGHT", "\"nodeId\": \"" + node->parent->id + "\", \"status\": \"black\"");
                    node->parent->parent->color = RED;
                    push_event("GRAPH_NODE_HIGHLIGHT", "\"nodeId\": \"" + node->parent->parent->id + "\", \"status\": \"red\"");
                    leftRotate(node->parent->parent);
                }
            }
        }
        root->color = BLACK;
        push_event("GRAPH_NODE_HIGHLIGHT", "\"nodeId\": \"" + root->id + "\", \"status\": \"black\"");
    }
};

// ── Static layout for INIT event ─────────────────────────────────────────

struct SNode { int val; string id; Color col; SNode* left = nullptr; SNode* right = nullptr; SNode* parent = nullptr; };
void s_leftRotate(SNode*& root, SNode* x) {
    SNode* y = x->right; x->right = y->left;
    if (y->left) y->left->parent = x;
    y->parent = x->parent;
    if (!x->parent) root = y;
    else if (x == x->parent->left) x->parent->left = y;
    else x->parent->right = y;
    y->left = x; x->parent = y;
}
void s_rightRotate(SNode*& root, SNode* y) {
    SNode* x = y->left; y->left = x->right;
    if (x->right) x->right->parent = y;
    x->parent = y->parent;
    if (!y->parent) root = x;
    else if (y == y->parent->right) y->parent->right = x;
    else y->parent->left = x;
    x->right = y; y->parent = x;
}
void s_fix(SNode*& root, SNode* node) {
    while (node->parent && node->parent->col == RED) {
        if (node->parent == node->parent->parent->left) {
            SNode* u = node->parent->parent->right;
            if (u && u->col == RED) {
                node->parent->col = BLACK; u->col = BLACK; node->parent->parent->col = RED; node = node->parent->parent;
            } else {
                if (node == node->parent->right) { node = node->parent; s_leftRotate(root, node); }
                node->parent->col = BLACK; node->parent->parent->col = RED; s_rightRotate(root, node->parent->parent);
            }
        } else {
            SNode* u = node->parent->parent->left;
            if (u && u->col == RED) {
                node->parent->col = BLACK; u->col = BLACK; node->parent->parent->col = RED; node = node->parent->parent;
            } else {
                if (node == node->parent->left) { node = node->parent; s_rightRotate(root, node); }
                node->parent->col = BLACK; node->parent->parent->col = RED; s_leftRotate(root, node->parent->parent);
            }
        }
    }
    root->col = BLACK;
}
SNode* s_ins(SNode*& root, int val) {
    SNode* node = new SNode{val, "n" + to_string(val), RED};
    SNode* parent = nullptr; SNode* curr = root;
    while (curr) { parent = curr; if (val < curr->val) curr = curr->left; else curr = curr->right; }
    node->parent = parent;
    if (!parent) root = node;
    else if (val < parent->val) parent->left = node;
    else parent->right = node;
    s_fix(root, node);
    return root;
}
void s_traverse(SNode* n, string& nodes_json, string& edges_json) {
    if (!n) return;
    nodes_json += "{\"id\": \"" + n->id + "\", \"label\": \"" + to_string(n->val) + "\", \"hidden\": true, \"x\": 0, \"y\": 0, \"vx\": 0, \"vy\": 0},";
    if (n->left) {
        edges_json += "{\"id\": \"e" + n->id + "-" + n->left->id + "\", \"from\": \"" + n->id + "\", \"to\": \"" + n->left->id + "\", \"hidden\": true, \"weight\": 0},";
        s_traverse(n->left, nodes_json, edges_json);
    }
    if (n->right) {
        edges_json += "{\"id\": \"e" + n->id + "-" + n->right->id + "\", \"from\": \"" + n->id + "\", \"to\": \"" + n->right->id + "\", \"hidden\": true, \"weight\": 0},";
        s_traverse(n->right, nodes_json, edges_json);
    }
}
void generate_static_layout(const vector<int>& arr) {
    SNode* root = nullptr;
    for (int v : arr) s_ins(root, v);
    string nodes_json = "[", edges_json = "[";
    s_traverse(root, nodes_json, edges_json);
    if (nodes_json.length() > 1) nodes_json.pop_back();
    if (edges_json.length() > 1) edges_json.pop_back();
    nodes_json += "]"; edges_json += "]";
    push_event("INIT", "\"graph\": {\"nodes\": " + nodes_json + ", \"edges\": " + edges_json + ", \"isDirected\": true, \"layoutHint\": \"dagre\"}");
}

int main() {
    vector<int> arr = {30, 15, 70, 10, 20, 60, 85};
    generate_static_layout(arr);

    push_event("SYSTEM_LOG", "\"level\": \"INFO\", \"message\": \"Rozpoczynam budowę drzewa czerwono-czarnego.\"");
    RedBlackTree rbt;
    for (int val : arr) {
        rbt.insert(val);
    }
    return 0;
}
