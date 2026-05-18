/**
 * @file tutorialStore.test.ts
 * @description Unit tests for the interactive tutorial Zustand store.
 */

// Mock sessionStorage for Node test environment BEFORE importing the store
if (typeof window === "undefined") {
  const mockStorage: Record<string, string> = {};
  const mockSessionStorage = {
    getItem: (key: string) => mockStorage[key] || null,
    setItem: (key: string, value: string) => {
      mockStorage[key] = value;
    },
    removeItem: (key: string) => {
      delete mockStorage[key];
    },
    clear: () => {
      Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
    },
    length: 0,
    key: (index: number) => Object.keys(mockStorage)[index] || null,
  };
  global.sessionStorage = mockSessionStorage;
  global.window = { sessionStorage: mockSessionStorage } as any;
}

import { describe, it, expect, beforeEach, vi } from "vitest";
import { useTutorialStore } from "../store/tutorialStore";
import type { TutorialStep } from "../types/tutorial";

describe("useTutorialStore", () => {
  const mockSteps: TutorialStep[] = [
    {
      id: "step-1",
      title: "Step 1 Title",
      content: "Step 1 Content",
      position: "bottom",
      onEnter: vi.fn(),
      onLeave: vi.fn(),
    },
    {
      id: "step-2",
      title: "Step 2 Title",
      content: "Step 2 Content",
      position: "top",
      onEnter: vi.fn(),
      onLeave: vi.fn(),
    },
  ];

  beforeEach(() => {
    // Reset Zustand store state before each test
    useTutorialStore.getState().stopTutorial();
    sessionStorage.clear();
    // Clear mocks after resetting the store so that any onLeave triggers in stopTutorial don't bleed into the test results
    vi.clearAllMocks();
  });

  it("should initialize with default state", () => {
    const state = useTutorialStore.getState();
    expect(state.isActive).toBe(false);
    expect(state.currentStepIndex).toBe(0);
    expect(state.steps).toEqual([]);
    expect(state.status).toBe("idle");
    expect(state.highlightRect).toBeNull();
    expect(state.popoverSide).toBe("auto");
  });

  it("should start tutorial and execute the first onEnter hook", () => {
    const store = useTutorialStore.getState();
    store.startTutorial(mockSteps);

    const state = useTutorialStore.getState();
    expect(state.isActive).toBe(true);
    expect(state.currentStepIndex).toBe(0);
    expect(state.steps).toEqual(mockSteps);
    expect(state.status).toBe("running");
    expect(state.popoverSide).toBe("bottom");
    expect(mockSteps[0].onEnter).toHaveBeenCalledTimes(1);
  });

  it("should navigate to next step and trigger hooks", async () => {
    const store = useTutorialStore.getState();
    store.startTutorial(mockSteps);

    await store.nextStep();

    const state = useTutorialStore.getState();
    expect(state.currentStepIndex).toBe(1);
    expect(state.status).toBe("running");
    expect(state.popoverSide).toBe("top");

    // Verify hooks for transitioning from step 0 to step 1
    expect(mockSteps[0].onLeave).toHaveBeenCalledTimes(1);
    expect(mockSteps[1].onEnter).toHaveBeenCalledTimes(1);
  });

  it("should transition to completed state when advancing beyond last step", async () => {
    const store = useTutorialStore.getState();
    store.startTutorial(mockSteps);

    await store.nextStep(); // to step-2
    await store.nextStep(); // beyond step-2

    const state = useTutorialStore.getState();
    expect(state.status).toBe("completed");
    expect(state.highlightRect).toBeNull();
    expect(mockSteps[1].onLeave).toHaveBeenCalledTimes(1);
  });

  it("should navigate to previous step and trigger hooks", async () => {
    const store = useTutorialStore.getState();
    store.startTutorial(mockSteps);

    await store.nextStep(); // to step-2
    await store.prevStep(); // back to step-1

    const state = useTutorialStore.getState();
    expect(state.currentStepIndex).toBe(0);
    expect(state.status).toBe("running");
    expect(state.popoverSide).toBe("bottom");

    expect(mockSteps[1].onLeave).toHaveBeenCalledTimes(1);
    expect(mockSteps[0].onEnter).toHaveBeenCalledTimes(2); // Initial and back navigation
  });

  it("should support pausing and resuming the tutorial", () => {
    const store = useTutorialStore.getState();
    store.startTutorial(mockSteps);

    store.pauseTutorial();
    expect(useTutorialStore.getState().status).toBe("paused");

    store.resumeTutorial();
    expect(useTutorialStore.getState().status).toBe("running");
  });

  it("should clear state on stopTutorial", () => {
    const store = useTutorialStore.getState();
    store.startTutorial(mockSteps);
    store.stopTutorial();

    const state = useTutorialStore.getState();
    expect(state.isActive).toBe(false);
    expect(state.currentStepIndex).toBe(0);
    expect(state.status).toBe("idle");
    expect(state.highlightRect).toBeNull();
  });

  it("should jump to specific steps within bounds", async () => {
    const store = useTutorialStore.getState();
    store.startTutorial(mockSteps);

    await store.jumpToStep(1);
    expect(useTutorialStore.getState().currentStepIndex).toBe(1);

    await store.jumpToStep(0);
    expect(useTutorialStore.getState().currentStepIndex).toBe(0);

    // Jump out of bounds should be ignored
    await store.jumpToStep(5);
    expect(useTutorialStore.getState().currentStepIndex).toBe(0);
  });
});
