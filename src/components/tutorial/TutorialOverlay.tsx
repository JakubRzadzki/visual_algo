/**
 * @file TutorialOverlay.tsx
 * @description The main backdrop and spotlight cutout overlay component for the interactive tutorial guide.
 *
 * Implements SVG masking with a dynamic spotlight hole using Framer Motion spring transitions.
 * Supports locking focus onto target elements, intercepting clicks outside the spotlight,
 * and rendering components through a React Portal.
 */

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useTutorialStore } from '../../store/tutorialStore';
import { useSpotlightPosition } from '../../hooks/useSpotlightPosition';
import { TutorialPopover } from './TutorialPopover';

/**
 * Renders the full-screen SVG spotlight overlay.
 *
 * Projects a dark translucent backdrop across the viewport, cutting out a highly-focused hole
 * surrounding the active element. Prevents background mouse interactions if `requiresInteraction` is false.
 */
export const TutorialOverlay: React.FC = () => {
  const { isActive, status, steps, currentStepIndex, highlightRect, nextStep, prevStep, stopTutorial } = useTutorialStore();

  const currentStep = steps[currentStepIndex];

  // Custom hook tracks coordinates of the data-tutorial-step elements
  useSpotlightPosition(isActive && status === 'running' && currentStep ? currentStep.id : null);

  // Hook into system preferences for reduced motion
  const shouldReduceMotion = useReducedMotion();

  // Listen to keyboard navigation events globally during active runs
  useEffect(() => {
    if (!isActive || status !== 'running') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'Right':
          e.preventDefault();
          nextStep();
          break;
        case 'ArrowLeft':
        case 'Left':
          e.preventDefault();
          prevStep();
          break;
        case 'Escape':
          e.preventDefault();
          if (window.confirm('Are you sure you want to exit the visual guide?')) {
            stopTutorial();
          }
          break;
        case ' ': // Spacebar
          // Prevent advancing if the user is typing in a terminal or Monaco editor
          const activeTag = document.activeElement?.tagName.toLowerCase();
          if (
            activeTag === 'input' ||
            activeTag === 'textarea' ||
            document.activeElement?.classList.contains('monaco-editor') ||
            document.activeElement?.closest('.monaco-editor')
          ) {
            return;
          }
          e.preventDefault();
          nextStep();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, status, nextStep, prevStep, stopTutorial]);

  if (!isActive || status === 'idle') return null;

  const spotlightShape = currentStep?.spotlightShape || 'rounded';
  const padding = currentStep?.spotlightPadding ?? 8;
  const requiresInteraction = currentStep?.requiresInteraction ?? false;

  // Compute boundaries for the spotlight hole cutout
  const x = highlightRect ? highlightRect.left - padding : 0;
  const y = highlightRect ? highlightRect.top - padding : 0;
  const width = highlightRect ? highlightRect.width + padding * 2 : 0;
  const height = highlightRect ? highlightRect.height + padding * 2 : 0;

  // Compute border-radius dynamically (circular cutouts use the radius equal to half of max side dimension)
  const rx = spotlightShape === 'circle'
    ? Math.max(width, height) / 2
    : spotlightShape === 'rounded'
      ? 8
      : 0;

  // Accessibility transitions bypass spring coordinates on reduced motion preference
  const spotlightTransition = shouldReduceMotion
    ? { duration: 0 }
    : {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      };

  const backdropTransition = shouldReduceMotion ? { duration: 0 } : { duration: 0.25 };

  const content = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9998] pointer-events-none overflow-hidden select-none">
        {/* SVG Cutout Layer */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          role="presentation"
          aria-hidden="true"
        >
          <defs>
            {/* The mask definitions */}
            <mask id="tutorial-spotlight-mask">
              {/* White fills the mask: retaining the translucent backdrop overlay */}
              <rect width="100%" height="100%" fill="white" />
              {/* Black subtracts from the mask: cutting out a completely transparent viewport cutout hole */}
              {highlightRect && (
                <motion.rect
                  fill="black"
                  initial={false}
                  animate={{
                    x,
                    y,
                    width,
                    height,
                    rx,
                    ry: rx,
                  }}
                  transition={spotlightTransition}
                />
              )}
            </mask>
          </defs>

          {/* Dark Translucent Overlay covering the entire screen, utilizing the mask */}
          <motion.rect
            width="100%"
            height="100%"
            fill="rgba(8, 10, 16, 0.78)"
            mask="url(#tutorial-spotlight-mask)"
            className="pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={backdropTransition}
          />

          {/* Interactive Blocker
              If we have a highlighted element:
              - If requiresInteraction is true: we mask the blocker, making the spotlight hole click-through.
              - If requiresInteraction is false: we omit the mask, blocking clicks EVERYWHERE including the spotlight hole.
          */}
          {highlightRect ? (
            requiresInteraction ? (
              <rect
                width="100%"
                height="100%"
                fill="transparent"
                mask="url(#tutorial-spotlight-mask)"
                style={{ pointerEvents: 'all' }}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              />
            ) : (
              <rect
                width="100%"
                height="100%"
                fill="transparent"
                style={{ pointerEvents: 'all' }}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              />
            )
          ) : null}
        </svg>

        {/* Global Fallback Blocker (when no element is highlighted or found in the DOM) */}
        {!highlightRect && (
          <div
            className="absolute inset-0 bg-slate-950/75 pointer-events-auto"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          />
        )}

        {/* Floating popover tooltip rendered directly in the portal overlay */}
        <TutorialPopover />
      </div>
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};
export default TutorialOverlay;
