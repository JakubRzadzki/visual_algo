/**
 * @file tutorialStore.ts
 * @description Zustand state store for managing the interactive tutorial system.
 *
 * Implements session storage persistence for active tutorial state,
 * bounds checking for step navigation, and lifecycle callbacks support.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { TutorialStep, PopoverSide } from "../types/tutorial";

/**
 * State properties of the interactive tutorial store.
 */
export interface TutorialState {
  /** Indicates if the tutorial is currently active (visible to the user). */
  isActive: boolean;

  /** Zero-based index of the currently active step. */
  currentStepIndex: number;

  /** Array of steps configured for the tutorial. */
  steps: TutorialStep[];

  /** Current execution status of the tutorial session. */
  status: "idle" | "running" | "paused" | "completed";

  /** Bounding box of the currently highlighted DOM element, or null if none. */
  highlightRect: DOMRect | null;

  /** The calculated or preferred placement side of the tutorial popover. */
  popoverSide: PopoverSide;
}

/**
 * Actions and mutators of the interactive tutorial store.
 */
export interface TutorialActions {
  /**
   * Starts the tutorial session.
   *
   * Resets the active step index to 0, sets status to 'running', and
   * initializes the step list if provided.
   *
   * @param steps - Optional list of tutorial steps to run.
   */
  startTutorial: (steps?: TutorialStep[]) => void;

  /**
   * Advances the tutorial to the next step.
   *
   * If the current step is the last one, sets status to 'completed'.
   * Handles calling `onLeave` and `onEnter` step lifecycle callbacks.
   */
  nextStep: () => Promise<void>;

  /**
   * Regresses the tutorial to the previous step.
   *
   * Prevents navigation beyond index 0.
   * Handles calling `onLeave` and `onEnter` step lifecycle callbacks.
   */
  prevStep: () => Promise<void>;

  /**
   * Pauses the tutorial, retaining the current step index.
   */
  pauseTutorial: () => void;

  /**
   * Resumes the paused tutorial, retaining the current step index.
   */
  resumeTutorial: () => void;

  /**
   * Terminates the tutorial session and resets all state variables.
   */
  stopTutorial: () => void;

  /**
   * Jumps directly to a specific step by index.
   *
   * Performs bounds verification before applying the change.
   *
   * @param index - Zero-based index of the destination step.
   */
  jumpToStep: (index: number) => Promise<void>;

  /**
   * Updates the highlighted element's bounding rect.
   *
   * @param rect - The new DOMRect or null.
   */
  setHighlightRect: (rect: DOMRect | null) => void;

  /**
   * Updates the active popover side placement.
   *
   * @param side - The placement side.
   */
  setPopoverSide: (side: PopoverSide) => void;
}

/**
 * Type representing the combined state and actions of the tutorial store.
 */
export type TutorialStore = TutorialState & TutorialActions;

export const useTutorialStore = create<TutorialStore>()(
  persist(
    (set, get) => ({
      // --- Initial State ---
      isActive: false,
      currentStepIndex: 0,
      steps: [],
      status: "idle",
      highlightRect: null,
      popoverSide: "auto",

      // --- Actions ---
      startTutorial: (steps) => {
        const targetSteps = steps || get().steps;
        if (!targetSteps || targetSteps.length === 0) return;

        set({
          steps: targetSteps,
          currentStepIndex: 0,
          isActive: true,
          status: "running",
          highlightRect: null,
          popoverSide: targetSteps[0]?.position || "auto",
        });

        // Trigger onEnter hook for the first step if defined
        const firstStep = targetSteps[0];
        if (firstStep?.onEnter) {
          try {
            const result = firstStep.onEnter();
            if (result instanceof Promise) {
              result.catch((err) => {
                console.error(
                  `Error in onEnter for step ${firstStep.id}:`,
                  err,
                );
              });
            }
          } catch (err) {
            console.error(`Error in onEnter for step ${firstStep.id}:`, err);
          }
        }
      },

      nextStep: async () => {
        const { currentStepIndex, steps, status } = get();
        if (steps.length === 0 || status === "completed") return;

        const currentStep = steps[currentStepIndex];

        // 1. Run onLeave callback for the step we are leaving
        if (currentStep?.onLeave) {
          try {
            await currentStep.onLeave();
          } catch (err) {
            console.error(
              `Error in onLeave callback for step ${currentStep.id}:`,
              err,
            );
          }
        }

        // 2. Calculate next step index
        const nextIndex = currentStepIndex + 1;

        if (nextIndex >= steps.length) {
          // Tutorial is complete — fully deactivate to remove the overlay and unblock the UI
          set({
            isActive: false,
            currentStepIndex: 0,
            status: "completed",
            highlightRect: null,
            popoverSide: "auto",
          });
          return;
        }

        const nextStep = steps[nextIndex];

        // 3. Run onEnter callback for the new step
        if (nextStep?.onEnter) {
          try {
            await nextStep.onEnter();
          } catch (err) {
            console.error(
              `Error in onEnter callback for step ${nextStep.id}:`,
              err,
            );
          }
        }

        set({
          currentStepIndex: nextIndex,
          popoverSide: nextStep.position || "auto",
          highlightRect: null, // clear rect to trigger recalculation
        });
      },

      prevStep: async () => {
        const { currentStepIndex, steps } = get();
        if (steps.length === 0 || currentStepIndex <= 0) return;

        const currentStep = steps[currentStepIndex];

        // 1. Run onLeave callback for the current step
        if (currentStep?.onLeave) {
          try {
            await currentStep.onLeave();
          } catch (err) {
            console.error(
              `Error in onLeave callback for step ${currentStep.id}:`,
              err,
            );
          }
        }

        // 2. Calculate previous step index
        const prevIndex = currentStepIndex - 1;
        const previousStep = steps[prevIndex];

        // 3. Run onEnter callback for the new step
        if (previousStep?.onEnter) {
          try {
            await previousStep.onEnter();
          } catch (err) {
            console.error(
              `Error in onEnter callback for step ${previousStep.id}:`,
              err,
            );
          }
        }

        set({
          currentStepIndex: prevIndex,
          popoverSide: previousStep.position || "auto",
          highlightRect: null, // clear rect to trigger recalculation
          status: "running", // in case it was completed
        });
      },

      pauseTutorial: () => {
        set({ status: "paused" });
      },

      resumeTutorial: () => {
        set({ status: "running" });
      },

      stopTutorial: () => {
        const { currentStepIndex, steps } = get();
        const currentStep = steps[currentStepIndex];

        if (currentStep?.onLeave) {
          try {
            const result = currentStep.onLeave();
            if (result instanceof Promise) {
              result.catch((err) => {
                console.error(
                  `Error in onLeave for step ${currentStep.id}:`,
                  err,
                );
              });
            }
          } catch (err) {
            console.error(`Error in onLeave for step ${currentStep.id}:`, err);
          }
        }

        set({
          isActive: false,
          currentStepIndex: 0,
          status: "idle",
          highlightRect: null,
          popoverSide: "auto",
        });
      },

      jumpToStep: async (index) => {
        const { steps, currentStepIndex } = get();
        if (index < 0 || index >= steps.length) return;

        const currentStep = steps[currentStepIndex];

        // Run current step's onLeave
        if (currentStep?.onLeave) {
          try {
            await currentStep.onLeave();
          } catch (err) {
            console.error(
              `Error in onLeave callback for step ${currentStep.id}:`,
              err,
            );
          }
        }

        const targetStep = steps[index];

        // Run target step's onEnter
        if (targetStep?.onEnter) {
          try {
            await targetStep.onEnter();
          } catch (err) {
            console.error(
              `Error in onEnter callback for step ${targetStep.id}:`,
              err,
            );
          }
        }

        set({
          currentStepIndex: index,
          popoverSide: targetStep.position || "auto",
          highlightRect: null,
          status: "running",
        });
      },

      setHighlightRect: (rect) => set({ highlightRect: rect }),
      setPopoverSide: (side) => set({ popoverSide: side }),
    }),
    {
      name: "visual-algo-tutorial",
      storage: createJSONStorage(() => sessionStorage),
      // Only persist the non-volatile state properties.
      // Exclude volatile ones like highlightRect which should be computed dynamically in the browser.
      partialize: (state) => ({
        isActive: state.isActive,
        currentStepIndex: state.currentStepIndex,
        steps: state.steps.map((step) => ({
          id: step.id,
          title: step.title,
          content: step.content,
          position: step.position,
          spotlightShape: step.spotlightShape,
          spotlightPadding: step.spotlightPadding,
          requiresInteraction: step.requiresInteraction,
          scrollOptions: step.scrollOptions,
        })),
        status: state.status,
      }),
    },
  ),
);
