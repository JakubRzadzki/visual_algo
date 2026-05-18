/**
 * @file tutorialSteps.ts
 * @description Centralized configuration defining the steps and metadata for the interactive walkthrough tutorial.
 */

import type { TutorialStep } from "../types/tutorial";

/**
 * Global array of steps that map out the guided tour of the Algorithm Visualizer workspace.
 */
export const tutorialSteps: TutorialStep[] = [
  {
    id: "navbar-home",
    title: "Welcome to Algorithm Visualizer! 🚀",
    content: `This interactive playground is designed to help you **see, modify, and understand** complex algorithms in action.

Let's take a quick 1-minute tour to explore the workspace and learn how to use its core components!`,
    position: "bottom",
    spotlightShape: "rounded",
    spotlightPadding: 6,
  },
  {
    id: "sidebar-algorithms",
    title: "Explore Algorithm Families 📚",
    content: `Use the sidebar to explore and select from a rich library of algorithms.

We support a wide array of categories including:
* **Sorting** (Bubble, Quick, Merge Sort)
* **Searching** (Binary, Linear Search)
* **Graph Algorithms** (Dijkstra, Kruskal, Prim, BFS/DFS)
* **Grid Pathfinding** (A*, Dijkstra)
* **Dynamic Programming** (Knapsack, Fibonacci)
* **Data Structures** (Binary Search Trees, Heaps)`,
    position: "right",
    spotlightShape: "rounded",
    spotlightPadding: 10,
  },
  {
    id: "code-editor",
    title: "Monaco Code Editor 💻",
    content: `Here you can inspect the exact code powering the active algorithm.

**Pro Tip:** This is a fully interactive Monaco editor with rich autocompletion and diagnostics. You can directly edit the code and test how your modifications impact the visual execution!`,
    position: "left",
    spotlightShape: "rounded",
    spotlightPadding: 8,
  },
  {
    id: "algorithm-viewer",
    title: "Interactive Visual Canvas 🎨",
    content: `Watch the algorithm come to life here! 

Whether it is animated vertical bars swapping, node edges flashing, or grid cells searching, all execution events (comparisons, visits, path discoveries) are rendered dynamically with high-quality transitions.`,
    position: "bottom",
    spotlightShape: "rounded",
    spotlightPadding: 8,
  },
  {
    id: "control-panel",
    title: "Playback Control Panel 🎛️",
    content: `This is your cockpit for animation control:
* **Play / Pause** the visualization playback.
* **Step** forward or backward frame-by-frame to analyze complex details.
* **Speed Slider** to dynamically adjust the animation rate in real-time.
* **Reset** the dataset to start fresh.`,
    position: "top",
    spotlightShape: "rounded",
    spotlightPadding: 8,
  },
];
export default tutorialSteps;
