/**
 * @file useSpotlightPosition.ts
 * @description React hook to calculate and track the screen coordinates of the active tutorial spotlight target.
 *
 * Listens to window resize, scroll, and orientation change events to keep the bounding rect in sync.
 * Includes smooth scrolling behavior to bring target elements into view.
 */

import { useEffect, useLayoutEffect, useCallback } from 'react';
import { useTutorialStore } from '../store/tutorialStore';

/**
 * Throttles the execution of a callback function using requestAnimationFrame.
 *
 * @param callback - The callback function to throttle.
 * @returns A throttled version of the callback.
 */
function throttle(callback: () => void): () => void {
  let queued = false;
  return () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      callback();
      queued = false;
    });
  };
}

/**
 * Debounces the execution of a callback function.
 *
 * @param callback - The callback function to debounce.
 * @param delay - The delay in milliseconds.
 * @returns A debounced version of the callback.
 */
function debounce(callback: () => void, delay: number): () => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return () => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback();
    }, delay);
  };
}

/**
 * Tracks the target element's DOMRect and updates the tutorial store's highlightRect.
 *
 * @param stepId - The unique data attribute key (e.g. data-tutorial-step) of the target element.
 */
export function useSpotlightPosition(stepId: string | null): void {
  const setHighlightRect = useTutorialStore((state) => state.setHighlightRect);
  const isActive = useTutorialStore((state) => state.isActive);
  const status = useTutorialStore((state) => state.status);

  const updatePosition = useCallback(() => {
    if (!stepId || !isActive || status !== 'running') {
      setHighlightRect(null);
      return;
    }

    const element = document.querySelector(`[data-tutorial-step="${stepId}"]`);
    if (element) {
      const rect = element.getBoundingClientRect();
      // Update store with the DOMRect
      setHighlightRect(rect);
    } else {
      // Element not found in DOM: set highlightRect to null (triggers center popover fallback)
      setHighlightRect(null);
    }
  }, [stepId, isActive, status, setHighlightRect]);

  // Handle scrolling and initial alignment
  useEffect(() => {
    if (!stepId || !isActive || status !== 'running') return;

    let isCancelled = false;

    const performFocus = async () => {
      const element = document.querySelector(`[data-tutorial-step="${stepId}"]`);
      if (element) {
        // Bring the element into the viewport first
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        });

        // Wait for smooth scrolling animation to complete (usually 500ms is standard)
        await new Promise((resolve) => setTimeout(resolve, 500));
        if (isCancelled) return;
      }
      updatePosition();
    };

    performFocus();

    return () => {
      isCancelled = true;
    };
  }, [stepId, isActive, status, updatePosition]);

  // Sync positions on resize, scroll, and content size updates
  useLayoutEffect(() => {
    if (!stepId || !isActive || status !== 'running') return;

    // Throttle scroll events for 60fps performance (16ms)
    const handleScroll = throttle(updatePosition);
    // Debounce resize events to let the layout settle (100ms)
    const handleResize = debounce(updatePosition, 100);

    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', updatePosition);

    // Watch for size mutations on the target element or its parents
    const targetElement = document.querySelector(`[data-tutorial-step="${stepId}"]`);
    let resizeObserver: ResizeObserver | null = null;
    if (targetElement && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updatePosition();
      });
      resizeObserver.observe(targetElement);
    }

    // Run once initially to capture layout coordinates
    updatePosition();

    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', updatePosition);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [stepId, isActive, status, updatePosition]);
}
