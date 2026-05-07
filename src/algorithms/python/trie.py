# Trie (Prefix Tree) Insertion and Word Matching in Python
# Implements efficient character-by-character string retrieval.

class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end_of_word = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        """
        Inserts a word into the prefix tree.
        """
        node = self.root
        for char in word.upper():
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.is_end_of_word = True

    def search(self, word: str) -> bool:
        """
        Returns true if the word is found in the Trie.
        """
        node = self.root
        for char in word.upper():
            if char not in node.children:
                return False
            node = node.children[char]
        return node.is_end_of_word

    def starts_with(self, prefix: str) -> bool:
        """
        Returns true if there is any word in the Trie that starts with the given prefix.
        """
        node = self.root
        for char in prefix.upper():
            if char not in node.children:
                return False
            node = node.children[char]
        return True

# Initialize Trie and insert sample words
trie = Trie()
trie.insert("CAT")
trie.insert("CAR")
trie.insert("DOG")

print("Search 'CAT':", trie.search("CAT")) # True
print("Search 'CAN':", trie.search("CAN")) # False
print("Prefix 'CA':", trie.starts_with("CA")) # True
