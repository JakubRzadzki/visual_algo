/**
 * @file presentationStore.ts
 * @description Zustand store managing the Presentation Mode slide deck.
 *
 * Drives the full-screen engineering presentation: an ordered deck of slides
 * (title, architecture, design patterns and the algorithm gallery). The store
 * only tracks navigation state — the actual content lives in
 * {@link PRESENTATION_SLIDES} and is rendered by {@link PresentationOverlay}.
 */

import { create } from "zustand";
import { PRESENTATION_SLIDES } from "../data/presentationSlides";

/** Number of seconds each slide is shown before auto-advancing (autoplay). */
export const AUTOPLAY_SECONDS = 15;

interface PresentationState {
  /** Whether presentation mode is currently active. */
  isActive: boolean;
  /** Current slide index in {@link PRESENTATION_SLIDES}. */
  currentIndex: number;
  /** Total number of slides. */
  totalSlides: number;
  /** Whether autoplay is running (auto-advances every {@link AUTOPLAY_SECONDS}). */
  isAutoPlaying: boolean;
  /** Direction of the last navigation (1 = forward, -1 = backward) for transitions. */
  direction: number;

  /** Open the presentation at the first slide. */
  startPresentation: () => void;
  /** Close the presentation and reset state. */
  stopPresentation: () => void;
  /** Advance to the next slide (clamped at the end). */
  nextSlide: () => void;
  /** Go back to the previous slide (clamped at the start). */
  prevSlide: () => void;
  /** Jump directly to a slide index. */
  jumpToSlide: (index: number) => void;
  /** Toggle the autoplay timer on/off. */
  toggleAutoPlay: () => void;
}

export const usePresentationStore = create<PresentationState>((set, get) => ({
  isActive: false,
  currentIndex: 0,
  totalSlides: PRESENTATION_SLIDES.length,
  isAutoPlaying: false,
  direction: 1,

  startPresentation: () => {
    set({
      isActive: true,
      currentIndex: 0,
      isAutoPlaying: false,
      direction: 1,
    });
  },

  stopPresentation: () => {
    set({
      isActive: false,
      currentIndex: 0,
      isAutoPlaying: false,
      direction: 1,
    });
  },

  nextSlide: () => {
    const { currentIndex, totalSlides } = get();
    if (currentIndex >= totalSlides - 1) {
      set({ isAutoPlaying: false });
      return;
    }
    set({ currentIndex: currentIndex + 1, direction: 1 });
  },

  prevSlide: () => {
    const { currentIndex } = get();
    if (currentIndex <= 0) return;
    set({ currentIndex: currentIndex - 1, direction: -1 });
  },

  jumpToSlide: (index) => {
    const { currentIndex, totalSlides } = get();
    if (index < 0 || index >= totalSlides || index === currentIndex) return;
    set({
      currentIndex: index,
      direction: index > currentIndex ? 1 : -1,
    });
  },

  toggleAutoPlay: () => {
    set((state) => ({ isAutoPlaying: !state.isAutoPlaying }));
  },
}));
