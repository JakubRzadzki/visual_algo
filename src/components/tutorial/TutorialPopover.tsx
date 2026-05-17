/**
 * @file TutorialPopover.tsx
 * @description The floating popover component for the interactive tutorial.
 *
 * Implements glassmorphic premium UI styling, floating-ui positioning against the target
 * highlight bounds, markdown rendering for description, and playback controls.
 */

import React, { useRef, useEffect } from 'react';
import { useFloating, autoUpdate, offset, flip, shift, arrow } from '@floating-ui/react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useTutorialStore } from '../../store/tutorialStore';

/**
 * Renders the popover containing the instructions for the active tutorial step.
 *
 * Utilizes `@floating-ui/react` to position itself relative to the active spotlight rect,
 * falling back to a screen-centered modal layout if no target element is present.
 */
export const TutorialPopover: React.FC = () => {
  const {
    steps,
    currentStepIndex,
    highlightRect,
    status,
    nextStep,
    prevStep,
    stopTutorial,
  } = useTutorialStore();

  const arrowRef = useRef<HTMLDivElement>(null);
  const currentStep = steps[currentStepIndex];

  // Configure Floating UI hook
  const preferredPosition = currentStep?.position || 'auto';
  const { x, y, strategy, refs, placement, middlewareData } = useFloating({
    placement: preferredPosition === 'auto' ? undefined : (preferredPosition as any),
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(14),
      flip({ fallbackAxisSideDirection: 'start' }),
      shift({ padding: 12 }),
      arrow({ element: arrowRef }),
    ],
  });

  // Dynamically feed the highlighted bounding rect from Zustand into Floating UI as a virtual reference
  useEffect(() => {
    if (highlightRect) {
      refs.setReference({
        getBoundingClientRect: () => highlightRect,
      });
    } else {
      refs.setReference(null);
    }
  }, [highlightRect, refs]);

  if (status !== 'running' || !currentStep) return null;

  const totalSteps = steps.length;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  // Arrow style computations based on placement
  const arrowX = middlewareData.arrow?.x;
  const arrowY = middlewareData.arrow?.y;

  const staticSide = {
    top: 'bottom',
    right: 'left',
    bottom: 'top',
    left: 'right',
  }[placement.split('-')[0]] || 'top';

  const arrowStyle: React.CSSProperties = {
    position: 'absolute',
    left: arrowX != null ? `${arrowX}px` : '',
    top: arrowY != null ? `${arrowY}px` : '',
    right: '',
    bottom: '',
    [staticSide]: '-6px',
    width: '12px',
    height: '12px',
    transform: 'rotate(45deg)',
  };

  // Determine popover position: floating relative to element vs centered fallback
  const popoverStyle: React.CSSProperties = highlightRect
    ? {
        position: strategy,
        left: x != null ? `${x}px` : '',
        top: y != null ? `${y}px` : '',
      }
    : {
        position: 'fixed',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      };

  return (
    <motion.div
      ref={refs.setFloating}
      style={popoverStyle}
      className={`z-[9999] max-w-sm sm:max-w-md w-[calc(100vw-32px)] text-white pointer-events-auto
        bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-[0_12px_40px_rgba(0,0,0,0.6)]
        rounded-2xl flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-[0_12px_50px_rgba(59,130,246,0.25)]`}
      initial={{ opacity: 0, scale: 0.95, y: highlightRect ? 10 : 0 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-popover-title"
      aria-describedby="tutorial-popover-desc"
    >
      {/* Popover Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-slate-800/40">
        <h3
          id="tutorial-popover-title"
          className="text-base font-bold bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent select-none"
        >
          {currentStep.title}
        </h3>
        <button
          onClick={stopTutorial}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
          aria-label="Close tutorial"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Popover Description */}
      <div id="tutorial-popover-desc" className="px-5 py-4 text-sm text-slate-300 leading-relaxed overflow-y-auto max-h-[250px] scrollbar-thin">
        <ReactMarkdown
          components={{
            p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
            strong: ({ node, ...props }) => <strong className="font-semibold text-blue-300" {...props} />,
            code: ({ node, ...props }) => <code className="bg-slate-800/80 border border-slate-700/30 rounded px-1.5 py-0.5 text-xs text-indigo-200 font-mono" {...props} />,
          }}
        >
          {currentStep.content}
        </ReactMarkdown>
      </div>

      {/* Popover Footer / Navigation Controls */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/40 border-t border-slate-800/40 select-none">
        {/* Step Progress Bubbles / Indicator */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] text-slate-400 font-medium">
            Step {currentStepIndex + 1} of {totalSteps}
          </span>
          <div className="flex gap-1">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 rounded-full transition-all duration-300 ${
                  idx === currentStepIndex
                    ? 'w-4 bg-blue-500'
                    : idx < currentStepIndex
                    ? 'w-2 bg-indigo-600/70'
                    : 'w-1 bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          {/* Back button */}
          {!isFirstStep && (
            <button
              onClick={prevStep}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-300 rounded-lg hover:text-white hover:bg-slate-800/60 active:scale-95 transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Back
            </button>
          )}

          {/* Next/Finish button */}
          <button
            onClick={nextStep}
            className={`flex items-center gap-1 px-4 py-1.5 text-xs font-bold text-white rounded-lg shadow-md active:scale-95 transition-all
              ${
                isLastStep
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 hover:shadow-emerald-950/20'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-950/20'
              }`}
          >
            {isLastStep ? (
              <>
                Finish
                <Check className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Floating Arrow Element */}
      {highlightRect && (
        <div
          ref={arrowRef}
          style={arrowStyle}
          className="bg-slate-900/80 border-r border-b border-slate-700/50 pointer-events-none"
        />
      )}
    </motion.div>
  );
};
