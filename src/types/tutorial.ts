/**
 * @file tutorial.ts
 * @description Type definitions and interfaces for the interactive tutorial (guided tour) system.
 *
 * Defines the configuration for tutorial steps, popover positions, spotlight shapes,
 * and DOM rect configurations used by the animation engine and UI stores.
 */

/**
 * The side of the target element where the popover should be rendered.
 * If 'auto', the positioning engine (floating-ui) will automatically choose the best side.
 */
export type PopoverSide = "top" | "bottom" | "left" | "right" | "auto";

/**
 * The geometric shape of the spotlight cutout overlay around the highlighted element.
 */
export type SpotlightShape = "rect" | "rounded" | "circle";

/**
 * Custom scroll options to control how the target element is scrolled into view.
 */
export interface ScrollOptions {
  /** The scroll behavior transition. */
  behavior: "smooth" | "instant";
  /** Vertical alignment. */
  block: "start" | "center" | "end" | "nearest";
  /** Horizontal alignment. */
  inline: "start" | "center" | "end" | "nearest";
}

/**
 * Represents a single step in the interactive tutorial guide.
 */
export interface TutorialStep {
  /**
   * Unique identifier for the step.
   * This must match the `data-tutorial-step` attribute in the target HTML element.
   */
  id: string;

  /**
   * Title of the tutorial step, displayed in the header of the popover.
   */
  title: string;

  /**
   * Body content of the tutorial step. Supports Markdown formatting.
   */
  content: string;

  /**
   * Preferred positioning of the popover relative to the highlighted element.
   * @default 'auto'
   */
  position?: PopoverSide;

  /**
   * The shape of the spotlight highlight mask.
   * @default 'rounded'
   */
  spotlightShape?: SpotlightShape;

  /**
   * Padding (in pixels) added around the target element's bounding box.
   * @default 8
   */
  spotlightPadding?: number;

  /**
   * Whether the user must interact with the target element (e.g., clicking it)
   * before they are allowed to advance to the next step.
   * @default false
   */
  requiresInteraction?: boolean;

  /**
   * Optional lifecycle callback executed right before this step is entered.
   * Can be asynchronous to allow for UI state changes (e.g. routing, tab switching).
   */
  onEnter?: () => void | Promise<void>;

  /**
   * Optional lifecycle callback executed right after this step is left.
   * Can be asynchronous to allow cleaning up or waiting for transitions.
   */
  onLeave?: () => void | Promise<void>;

  /**
   * Custom scroll options used to bring the highlighted element into view.
   */
  scrollOptions?: ScrollOptions;
}
