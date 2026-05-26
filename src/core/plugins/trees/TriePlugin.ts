import type {
  AlgorithmPlugin,
  ExecutionTrace,
  ArrayInput,
  GraphInput,
  VisualizationEvent,
  EventPayload,
} from "../../../types";

export class TriePlugin implements AlgorithmPlugin<ArrayInput> {
  id = "trie";
  name = "Trie Prefix Tree";
  category = "tree" as const;

  execute(data: ArrayInput): ExecutionTrace {
    let rawValues = data.values && data.values.length > 0 ? data.values : [];
    
    // Convert numeric array into strings. If empty, use a sensible default.
    let strings = rawValues.length > 0 ? rawValues.map(String) : ["cat", "car", "dog"];
    
    const events: VisualizationEvent[] = [];
    let step = 0;
    const startTime = performance.now();

    const push = (evt: EventPayload) => {
      events.push({
        ...evt,
        id: crypto.randomUUID(),
        timestamp: performance.now(),
        step: step++,
      });
    };

    class TrieNode {
      char: string;
      id: string;
      children: Map<string, TrieNode> = new Map();
      isEndOfWord: boolean = false;
      constructor(char: string, id: string) {
        this.char = char;
        this.id = id;
      }
    }

    let nextId = 0;
    const root = new TrieNode("Root", `n${nextId++}`);

    const nodes: { id: string; label: string; hidden: boolean; isEnd: boolean }[] = [];
    const edges: { id: string; from: string; to: string; hidden: boolean; char: string }[] = [];

    // Phase 1: Build static layout graph
    const staticInsert = (word: string) => {
      let curr = root;
      for (let i = 0; i < word.length; i++) {
        const char = word[i];
        if (!curr.children.has(char)) {
          const newNode = new TrieNode(char, `n${nextId++}`);
          curr.children.set(char, newNode);
        }
        curr = curr.children.get(char)!;
      }
      curr.isEndOfWord = true;
    };

    strings.forEach(staticInsert);

    const traverse = (n: TrieNode) => {
      nodes.push({ id: n.id, label: n.char, hidden: true, isEnd: n.isEndOfWord });
      for (const [char, child] of n.children.entries()) {
        edges.push({ id: `e${n.id}-${child.id}`, from: n.id, to: child.id, hidden: true, char });
        traverse(child);
      }
    };
    traverse(root);

    // Phase 2: Simulate insertions and emit events
    push({ type: "SYSTEM_LOG", level: "INFO", message: "Starting Trie construction." });
    
    // Add Root node visibly immediately
    push({ type: "GRAPH_NODE_ADD", nodeId: root.id });

    // Local simulation tree
    const simRoot = new TrieNode("Root", root.id);
    let simNextId = 1; // Since root is 0

    const simInsert = (word: string) => {
      push({ type: "SYSTEM_LOG", level: "INFO", message: `Inserting word: "${word}"` });
      let curr = simRoot;
      push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: curr.id, status: "current" });

      for (let i = 0; i < word.length; i++) {
        const char = word[i];
        if (!curr.children.has(char)) {
          // deterministic ID mapping: simNextId matches nextId.
          const targetId = `n${simNextId++}`;
          const newNode = new TrieNode(char, targetId);
          curr.children.set(char, newNode);

          push({ type: "GRAPH_NODE_ADD", nodeId: targetId });
          push({ type: "GRAPH_EDGE_ADD", edgeId: `e${curr.id}-${targetId}`, from: curr.id, to: targetId });
          push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: targetId, status: "visited" });
        } else {
          push({ type: "GRAPH_EDGE_HIGHLIGHT", edgeId: `e${curr.id}-${curr.children.get(char)!.id}`, accepted: true });
        }
        curr = curr.children.get(char)!;
        push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: curr.id, status: "current" });
      }
      
      curr.isEndOfWord = true;
      push({ type: "SYSTEM_LOG", level: "INFO", message: `Word "${word}" inserted completely.` });
    };

    strings.forEach(simInsert);

    const initialGraph: GraphInput = {
      nodes: nodes.map((n) => ({
        id: n.id,
        label: n.label,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        hidden: true,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        from: e.from,
        to: e.to,
        weight: 0,
        label: e.char, // Optionally show char on edge
        hidden: true,
      })),
      isDirected: true,
      layoutHint: "dagre",
    };

    return {
      events,
      metadata: {
        timeComplexity: "O(w) where w is word length",
        spaceComplexity: "O(w)",
        executionTimeMs: performance.now() - startTime,
        nodeCount: nodes.length,
        algorithmName: this.name,
        initialGraph,
      },
    };
  }
}
