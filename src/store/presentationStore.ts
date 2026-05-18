/**
 * @file presentationStore.ts
 * @description Zustand store managing the Presentation Mode state machine.
 *
 * Controls the auto-pilot showcase that cycles through every available algorithm,
 * alternating between Python and C++ source code on each step, automatically
 * navigating to the appropriate route and triggering sandbox execution.
 */

import { create } from "zustand";
import {
  ALGORITHM_CATALOG,
  type AlgorithmEntry,
  type CategoryEntry,
} from "../data/algorithmCatalog";

/** Supported source code languages for alternation. */
type PresentationLanguage = "python" | "cpp";

/** A single item in the presentation playlist. */
export interface PresentationItem {
  /** The category entry from the algorithm catalog. */
  category: CategoryEntry;
  /** The algorithm entry from the catalog. */
  algorithm: AlgorithmEntry;
  /** Which language to show for this particular slide. */
  language: PresentationLanguage;
  /** The route path for navigation, e.g. "/algo/sorting/merge-sort". */
  route: string;
}

/** Current phase of a single presentation slide. */
type SlidePhase =
  | "navigating"
  | "loading-code"
  | "running"
  | "animating"
  | "done";

interface PresentationState {
  /** Whether presentation mode is currently active. */
  isActive: boolean;
  /** Full ordered playlist of algorithm slides. */
  playlist: PresentationItem[];
  /** Current index in the playlist. */
  currentIndex: number;
  /** Current phase of the active slide lifecycle. */
  slidePhase: SlidePhase;
  /** Seconds remaining before auto-advancing to the next slide. */
  countdownSeconds: number;
  /** Whether the presentation is paused (user interaction). */
  isPaused: boolean;

  /** Start presentation mode — builds the playlist and begins cycling. */
  startPresentation: () => void;
  /** Stop presentation mode and reset all state. */
  stopPresentation: () => void;
  /** Advance to the next slide manually. */
  nextSlide: () => void;
  /** Go back to the previous slide. */
  prevSlide: () => void;
  /** Toggle pause/resume. */
  togglePause: () => void;
  /** Update the slide phase. */
  setSlidePhase: (phase: SlidePhase) => void;
  /** Update countdown timer value. */
  setCountdown: (seconds: number) => void;
  /** Jump to a specific slide index. */
  jumpToSlide: (index: number) => void;
}

/**
 * Builds the full presentation playlist from the algorithm catalog.
 * Each algorithm appears twice — once in Python, once in C++ —
 * alternating languages across slides.
 *
 * @returns Ordered array of PresentationItem entries.
 */
function buildPlaylist(): PresentationItem[] {
  const items: PresentationItem[] = [];
  let langToggle: PresentationLanguage = "python";

  for (const category of ALGORITHM_CATALOG) {
    for (const algo of category.algorithms) {
      if (!algo.available) continue;

      // Map category.id to route segment
      const categoryRoute = category.id === "trees" ? "trees" : category.id;

      items.push({
        category,
        algorithm: algo,
        language: langToggle,
        route: `/algo/${categoryRoute}/${algo.id}`,
      });

      // Alternate language for the next slide
      langToggle = langToggle === "python" ? "cpp" : "python";
    }
  }

  return items;
}

export const usePresentationStore = create<PresentationState>((set, get) => ({
  isActive: false,
  playlist: [],
  currentIndex: 0,
  slidePhase: "navigating",
  countdownSeconds: 0,
  isPaused: false,

  startPresentation: () => {
    const playlist = buildPlaylist();
    if (playlist.length === 0) return;
    set({
      isActive: true,
      playlist,
      currentIndex: 0,
      slidePhase: "navigating",
      countdownSeconds: 0,
      isPaused: false,
    });
  },

  stopPresentation: () => {
    set({
      isActive: false,
      playlist: [],
      currentIndex: 0,
      slidePhase: "navigating",
      countdownSeconds: 0,
      isPaused: false,
    });
  },

  nextSlide: () => {
    const { playlist, currentIndex } = get();
    if (currentIndex >= playlist.length - 1) {
      // Reached end — stop presentation
      get().stopPresentation();
      return;
    }
    set({
      currentIndex: currentIndex + 1,
      slidePhase: "navigating",
      countdownSeconds: 0,
    });
  },

  prevSlide: () => {
    const { currentIndex } = get();
    if (currentIndex <= 0) return;
    set({
      currentIndex: currentIndex - 1,
      slidePhase: "navigating",
      countdownSeconds: 0,
    });
  },

  togglePause: () => {
    set((state) => ({ isPaused: !state.isPaused }));
  },

  setSlidePhase: (phase) => {
    set({ slidePhase: phase });
  },

  setCountdown: (seconds) => {
    set({ countdownSeconds: seconds });
  },

  jumpToSlide: (index) => {
    const { playlist } = get();
    if (index < 0 || index >= playlist.length) return;
    set({
      currentIndex: index,
      slidePhase: "navigating",
      countdownSeconds: 0,
    });
  },
}));
