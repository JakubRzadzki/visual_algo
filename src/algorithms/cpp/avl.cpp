#include <iostream>
#include <vector>
#include <algorithm>
#include <string>
#include <set>
#include <map>

using namespace std;

void push_event(const string& type, const string& payload_json) {
    cout << "{\"type\": \"" << type << "\", " << payload_json << "}" << endl;
}

// ── AVL Node ──────────────────────────────────────────────────────────────

class Node {
public:
    int key;
    string id;
    Node *left;
    Node *right;
    int height;
};

int height(Node *N) {
    if (N == NULL) return 0;
    return N->height;
}

int getBalance(Node *N) {
    if (N == NULL) return 0;
    return height(N->left) - height(N->right);
}

Node* newNode(int key, const string& id) {
    Node* node = new Node();
    node->key = key;
    node->id = id;
    node->left = NULL;
    node->right = NULL;
    node->height = 1;
    return node;
}

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

    // Remove stale
    vector<string> to_remove;
    for (const auto& eid : active_edges) {
        if (desired.find(eid) == desired.end()) {
            push_event("GRAPH_EDGE_REMOVE", "\"edgeId\": \"" + eid + "\"");
            to_remove.push_back(eid);
        }
    }
    for (const auto& eid : to_remove) active_edges.erase(eid);

    // Add new
    for (const auto& [eid, endpoints] : desired) {
        if (active_edges.find(eid) == active_edges.end()) {
            push_event("GRAPH_EDGE_ADD",
                "\"edgeId\": \"" + eid + "\", \"from\": \"" + endpoints.first +
                "\", \"to\": \"" + endpoints.second + "\"");
            active_edges.insert(eid);
        }
    }
}

// ── Rotations ────────────────────────────────────────────────────────────

Node *rightRotate(Node *y) {
    Node *x = y->left;
    Node *T2 = x->right;

    push_event("SYSTEM_LOG", "\"level\": \"WARN\", \"message\": \"Identyfikacja węzłów: [parent]=" + to_string(y->key) + " oraz jego LEWE dziecko [pivot]=" + to_string(x->key) + ".\"");
    push_event("SYSTEM_LOG", "\"level\": \"WARN\", \"message\": \"[pivot] " + to_string(x->key) + " WZNOSI SIĘ w górę — przejmuje miejsce węzła [parent] " + to_string(y->key) + ".\"");
    push_event("SYSTEM_LOG", "\"level\": \"WARN\", \"message\": \"[parent] " + to_string(y->key) + " OPADA w dół — staje się PRAWYM dzieckiem węzła [pivot] " + to_string(x->key) + ".\"");
    push_event("SYSTEM_LOG", "\"level\": \"INFO\", \"message\": \"Oryginalne PRAWE poddrzewo węzła [pivot] " + to_string(x->key) + " zostaje przeniesione i staje się NOWYM LEWYM dzieckiem węzła [parent] " + to_string(y->key) + ".\"");

    x->right = y;
    y->left = T2;

    y->height = max(height(y->left), height(y->right)) + 1;
    x->height = max(height(x->left), height(x->right)) + 1;

    push_event("GRAPH_NODE_HIGHLIGHT", "\"nodeId\": \"" + x->id + "\", \"status\": \"rotate\"");
    push_event("GRAPH_NODE_HIGHLIGHT", "\"nodeId\": \"" + y->id + "\", \"status\": \"rotate\"");
    sync_tree(x);
    push_event("GRAPH_NODE_HIGHLIGHT", "\"nodeId\": \"" + x->id + "\", \"status\": \"default\"");
    push_event("GRAPH_NODE_HIGHLIGHT", "\"nodeId\": \"" + y->id + "\", \"status\": \"default\"");

    return x;
}

Node *leftRotate(Node *x) {
    Node *y = x->right;
    Node *T2 = y->left;

    push_event("SYSTEM_LOG", "\"level\": \"WARN\", \"message\": \"Identyfikacja węzłów: [parent]=" + to_string(x->key) + " oraz jego PRAWE dziecko [pivot]=" + to_string(y->key) + ".\"");
    push_event("SYSTEM_LOG", "\"level\": \"WARN\", \"message\": \"[pivot] " + to_string(y->key) + " WZNOSI SIĘ w górę — przejmuje miejsce węzła [parent] " + to_string(x->key) + ".\"");
    push_event("SYSTEM_LOG", "\"level\": \"WARN\", \"message\": \"[parent] " + to_string(x->key) + " OPADA w dół — staje się LEWYM dzieckiem węzła [pivot] " + to_string(y->key) + ".\"");
    push_event("SYSTEM_LOG", "\"level\": \"INFO\", \"message\": \"Oryginalne LEWE poddrzewo węzła [pivot] " + to_string(y->key) + " zostaje przeniesione i staje się NOWYM PRAWYM dzieckiem węzła [parent] " + to_string(x->key) + ".\"");

    y->left = x;
    x->right = T2;

    x->height = max(height(x->left), height(x->right)) + 1;
    y->height = max(height(y->left), height(y->right)) + 1;

    push_event("GRAPH_NODE_HIGHLIGHT", "\"nodeId\": \"" + x->id + "\", \"status\": \"rotate\"");
    push_event("GRAPH_NODE_HIGHLIGHT", "\"nodeId\": \"" + y->id + "\", \"status\": \"rotate\"");
    sync_tree(y);
    push_event("GRAPH_NODE_HIGHLIGHT", "\"nodeId\": \"" + x->id + "\", \"status\": \"default\"");
    push_event("GRAPH_NODE_HIGHLIGHT", "\"nodeId\": \"" + y->id + "\", \"status\": \"default\"");

    return y;
}

// ── Insert ───────────────────────────────────────────────────────────────

Node* insert(Node* node, int key, const string& parent_id = "") {
    if (node == NULL) {
        string node_id = "n" + to_string(key);
        push_event("GRAPH_NODE_ADD", "\"nodeId\": \"" + node_id + "\"");
        if (parent_id != "") {
            string eid = "e" + parent_id + "-" + node_id;
            push_event("GRAPH_EDGE_ADD", "\"edgeId\": \"" + eid +
                "\", \"from\": \"" + parent_id + "\", \"to\": \"" + node_id + "\"");
            active_edges.insert(eid);
        }
        push_event("GRAPH_NODE_HIGHLIGHT", "\"nodeId\": \"" + node_id + "\", \"status\": \"visited\"");
        return newNode(key, node_id);
    }

    push_event("GRAPH_NODE_HIGHLIGHT", "\"nodeId\": \"" + node->id + "\", \"status\": \"current\"");

    if (key < node->key) {
        push_event("SYSTEM_LOG", "\"level\": \"INFO\", \"message\": \"" +
            to_string(key) + " < " + to_string(node->key) + " → idę w lewo\"");
        if (node->left)
            push_event("GRAPH_EDGE_HIGHLIGHT", "\"edgeId\": \"e" + node->id +
                "-" + node->left->id + "\", \"accepted\": true");
        node->left = insert(node->left, key, node->id);
    } else if (key > node->key) {
        push_event("SYSTEM_LOG", "\"level\": \"INFO\", \"message\": \"" +
            to_string(key) + " > " + to_string(node->key) + " → idę w prawo\"");
        if (node->right)
            push_event("GRAPH_EDGE_HIGHLIGHT", "\"edgeId\": \"e" + node->id +
                "-" + node->right->id + "\", \"accepted\": true");
        node->right = insert(node->right, key, node->id);
    } else {
        return node;
    }

    node->height = 1 + max(height(node->left), height(node->right));
    int balance = getBalance(node);

    push_event("SYSTEM_LOG", "\"level\": \"INFO\", \"message\": \"BF(" +
        to_string(node->key) + ") = " + to_string(balance) + "\"");

    // LL
    if (balance > 1 && key < node->left->key) {
        push_event("SYSTEM_LOG", "\"level\": \"WARN\", \"message\": \"Przypadek LL na węźle " +
            to_string(node->key) + " (BF=" + to_string(balance) + ")\"");
        Node* result = rightRotate(node);
        sync_tree(result);
        return result;
    }
    // RR
    if (balance < -1 && key > node->right->key) {
        push_event("SYSTEM_LOG", "\"level\": \"WARN\", \"message\": \"Przypadek RR na węźle " +
            to_string(node->key) + " (BF=" + to_string(balance) + ")\"");
        Node* result = leftRotate(node);
        sync_tree(result);
        return result;
    }
    // LR
    if (balance > 1 && key > node->left->key) {
        push_event("SYSTEM_LOG", "\"level\": \"WARN\", \"message\": \"Przypadek LR na węźle " +
            to_string(node->key) + " (BF=" + to_string(balance) + ")\"");
        node->left = leftRotate(node->left);
        sync_tree(node);
        Node* result = rightRotate(node);
        sync_tree(result);
        return result;
    }
    // RL
    if (balance < -1 && key < node->right->key) {
        push_event("SYSTEM_LOG", "\"level\": \"WARN\", \"message\": \"Przypadek RL na węźle " +
            to_string(node->key) + " (BF=" + to_string(balance) + ")\"");
        node->right = rightRotate(node->right);
        sync_tree(node);
        Node* result = leftRotate(node);
        sync_tree(result);
        return result;
    }

    return node;
}

// ── Static layout for INIT event ─────────────────────────────────────────

struct SNode { int val; string id; SNode* left = nullptr; SNode* right = nullptr; int h = 1; };
int sh(SNode* n) { return n ? n->h : 0; }
int sbal(SNode* n) { return n ? sh(n->left) - sh(n->right) : 0; }
SNode* s_right(SNode* y) {
    SNode* x = y->left; y->left = x->right; x->right = y;
    y->h = 1 + max(sh(y->left), sh(y->right));
    x->h = 1 + max(sh(x->left), sh(x->right));
    return x;
}
SNode* s_left(SNode* x) {
    SNode* y = x->right; x->right = y->left; y->left = x;
    x->h = 1 + max(sh(x->left), sh(x->right));
    y->h = 1 + max(sh(y->left), sh(y->right));
    return y;
}
SNode* s_ins(SNode* node, int val) {
    if (!node) return new SNode{val, "n" + to_string(val)};
    if (val < node->val) node->left = s_ins(node->left, val);
    else if (val > node->val) node->right = s_ins(node->right, val);
    else return node;
    node->h = 1 + max(sh(node->left), sh(node->right));
    int bal = sbal(node);
    if (bal > 1 && val < node->left->val) return s_right(node);
    if (bal < -1 && val > node->right->val) return s_left(node);
    if (bal > 1 && val > node->left->val) { node->left = s_left(node->left); return s_right(node); }
    if (bal < -1 && val < node->right->val) { node->right = s_right(node->right); return s_left(node); }
    return node;
}
void traverse(SNode* n, string& nodes_json, string& edges_json) {
    if (!n) return;
    nodes_json += "{\"id\": \"" + n->id + "\", \"label\": \"" + to_string(n->val) + "\", \"hidden\": true, \"x\": 0, \"y\": 0, \"vx\": 0, \"vy\": 0},";
    if (n->left) {
        edges_json += "{\"id\": \"e" + n->id + "-" + n->left->id + "\", \"from\": \"" + n->id + "\", \"to\": \"" + n->left->id + "\", \"hidden\": true, \"weight\": 0},";
        traverse(n->left, nodes_json, edges_json);
    }
    if (n->right) {
        edges_json += "{\"id\": \"e" + n->id + "-" + n->right->id + "\", \"from\": \"" + n->id + "\", \"to\": \"" + n->right->id + "\", \"hidden\": true, \"weight\": 0},";
        traverse(n->right, nodes_json, edges_json);
    }
}
void generate_static_layout(const vector<int>& arr) {
    SNode* root = nullptr;
    for (int v : arr) root = s_ins(root, v);
    string nodes_json = "[", edges_json = "[";
    traverse(root, nodes_json, edges_json);
    if (nodes_json.length() > 1) nodes_json.pop_back();
    if (edges_json.length() > 1) edges_json.pop_back();
    nodes_json += "]"; edges_json += "]";
    push_event("INIT", "\"graph\": {\"nodes\": " + nodes_json + ", \"edges\": " + edges_json + ", \"isDirected\": true, \"layoutHint\": \"dagre\"}");
}

int main() {
    vector<int> arr = {10, 20, 30, 40, 50, 25};
    generate_static_layout(arr);

    push_event("SYSTEM_LOG", "\"level\": \"INFO\", \"message\": \"Rozpoczynam budowę drzewa AVL.\"");
    Node *root = NULL;
    for (int val : arr) {
        push_event("SYSTEM_LOG", "\"level\": \"INFO\", \"message\": \"── Wstawiam " + to_string(val) + " ──\"");
        root = insert(root, val);
        sync_tree(root);
    }
    return 0;
}
