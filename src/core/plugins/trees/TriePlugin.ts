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

    // Dynamic layout state
    let lastCoords = new Map<string, {x: number, y: number}>();
    const updateLayout = (simRoot: TrieNode) => {
      const widths = new Map<string, number>();
      const depths = new Map<string, number>();
      let maxDepth = 0;

      const calcWidths = (n: TrieNode, depth: number): number => {
        depths.set(n.id, depth);
        if (depth > maxDepth) maxDepth = depth;
        let w = 0;
        for (const child of n.children.values()) {
          w += calcWidths(child, depth + 1);
        }
        if (w === 0) w = 1;
        widths.set(n.id, w);
        return w;
      };

      calcWidths(simRoot, 0);

      const SVG_WIDTH = 800;
      const SVG_HEIGHT = 600;
      const paddingX = 60;
      const paddingY = 80;
      
      const stepY = maxDepth > 0 ? (SVG_HEIGHT - 2 * paddingY) / maxDepth : 0;
      
      const assignCoords = (n: TrieNode, leftBound: number, rightBound: number) => {
        const d = depths.get(n.id) || 0;
        const x = (leftBound + rightBound) / 2;
        const y = paddingY + d * Math.min(stepY, 120);
        
        const old = lastCoords.get(n.id);
        if (!old || old.x !== x || old.y !== y) {
          push({ type: "GRAPH_NODE_MOVE", nodeId: n.id, x, y });
          lastCoords.set(n.id, { x, y });
        }

        const myWidth = widths.get(n.id) || 1;
        let currentLeft = leftBound;
        const sortedChildren = Array.from(n.children.values()).sort((a, b) => a.char.localeCompare(b.char));

        for (const child of sortedChildren) {
          const childWidth = widths.get(child.id) || 1;
          const portion = childWidth / myWidth;
          const currentRight = currentLeft + portion * (rightBound - leftBound);
          assignCoords(child, currentLeft, currentRight);
          currentLeft = currentRight;
        }
      };

      assignCoords(simRoot, paddingX, SVG_WIDTH - paddingX);
    };

    // Phase 2: Simulate insertions and emit events
    push({ type: "SYSTEM_LOG", level: "INFO", message: "Starting Trie construction." });
    
    // Add Root node visibly immediately
    push({ type: "GRAPH_NODE_ADD", nodeId: root.id });

    // Local simulation tree
    const simRoot = new TrieNode("Root", root.id);
    let simNextId = 1; // Since root is 0
    
    // Initialize root pos
    updateLayout(simRoot);

    const simInsert = (word: string) => {
      push({ type: "SYSTEM_LOG", level: "INFO", message: `Inserting word: "${word}"` });
      let curr = simRoot;
      push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: curr.id, status: "current" });

      for (let i = 0; i < word.length; i++) {
        const char = word[i];
        if (!curr.children.has(char)) {
          const targetId = `n${simNextId++}`;
          const newNode = new TrieNode(char, targetId);
          curr.children.set(char, newNode);

          push({ type: "GRAPH_NODE_ADD", nodeId: targetId });
          
          const parentPos = lastCoords.get(curr.id);
          const startX = parentPos ? parentPos.x : 400;
          const startY = parentPos ? parentPos.y : 80;
          push({ type: "GRAPH_NODE_MOVE", nodeId: targetId, x: startX, y: startY });
          lastCoords.set(targetId, { x: startX, y: startY });
          
          push({ type: "GRAPH_EDGE_ADD", edgeId: `e${curr.id}-${targetId}`, from: curr.id, to: targetId });
          push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: targetId, status: "visited" });
          
          updateLayout(simRoot);
        } else {
          push({ type: "GRAPH_EDGE_HIGHLIGHT", edgeId: `e${curr.id}-${curr.children.get(char)!.id}`, accepted: true });
        }
        curr = curr.children.get(char)!;
        push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: curr.id, status: "current" });
      }
      
      curr.isEndOfWord = true;
      // Mark node as end of word visually (e.g. highlight or green)
      push({ type: "GRAPH_NODE_HIGHLIGHT", nodeId: curr.id, status: "finished" });
      push({ type: "SYSTEM_LOG", level: "INFO", message: `Word "${word}" inserted completely.` });
    };

    strings.forEach(simInsert);

    const initialGraph: GraphInput = {
      nodes: nodes.map((n) => ({
        id: n.id,
        label: n.label,
        x: lastCoords.get(n.id)?.x || 0,
        y: lastCoords.get(n.id)?.y || 0,
        vx: 0,
        vy: 0,
        hidden: true,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        from: e.from,
        to: e.to,
        weight: 0,
        label: e.char,
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
