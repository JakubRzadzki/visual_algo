// Trie (Prefix Tree) Insertion and Word Matching in C++
// Implements efficient character-by-character string retrieval.

#include <iostream>
#include <unordered_map>
#include <string>

struct TrieNode {
    std::unordered_map<char, TrieNode*> children;
    bool isEndOfWord = false;
};

class Trie {
private:
    TrieNode* root;

public:
    Trie() {
        root = new TrieNode();
    }

    void insert(std::string word) {
        TrieNode* node = root;
        for (char c : word) {
            c = toupper(c);
            if (node->children.find(c) == node->children.end()) {
                node->children[c] = new TrieNode();
            }
            node = node->children[c];
        }
        node->isEndOfWord = true;
    }

    bool search(std::string word) {
        TrieNode* node = root;
        for (char c : word) {
            c = toupper(c);
            if (node->children.find(c) == node->children.end()) {
                return false;
            }
            node = node->children[c];
        }
        return node->isEndOfWord;
    }

    bool startsWith(std::string prefix) {
        TrieNode* node = root;
        for (char c : prefix) {
            c = toupper(c);
            if (node->children.find(c) == node->children.end()) {
                return false;
            }
            node = node->children[c];
        }
        return true;
    }
};

int main() {
    Trie trie;
    trie.insert("CAT");
    trie.insert("CAR");
    trie.insert("DOG");

    std::cout << "Trie initialized and words inserted successfully." << std::endl;
    return 0;
}
