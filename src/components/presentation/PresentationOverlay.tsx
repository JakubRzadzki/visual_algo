/**
 * @file PresentationOverlay.tsx
 * @description Full-screen cinematic slide-deck presentation overlay.
 *
 * Renders the EDVR engineering presentation as a sequence of styled slides
 * (title, architecture, design patterns and the algorithm gallery). Slides are
 * defined in {@link PRESENTATION_SLIDES}.
 *
 * Concept slides render as an opaque full-screen glass deck. Algorithm slides
 * are "live": the overlay navigates to the real in-app visualizer route, plays
 * the animation, and renders the slide content (title, code, complexity, note)
 * as a light overlay on top of the running visualization.
 */

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  X,
  Monitor,
  FolderGit2,
  ArrowRight,
  Sparkles,
  Code2,
} from "lucide-react";
import {
  usePresentationStore,
  AUTOPLAY_SECONDS,
} from "../../store/presentationStore";
import {
  PRESENTATION_SLIDES,
  type PresentationSlide,
} from "../../data/presentationSlides";
import { globalEngine } from "../../core/AnimationEngine";

/** Categories whose visualization is triggered via the editor Run button. */
const RUN_TRIGGER_CATEGORIES = ["sorting", "searching", "dp"];

/** Maps a slide code language id to its display label. */
const LANG_LABEL: Record<string, string> = {
  typescript: "TypeScript",
  go: "Go",
  markup: "SVG",
  python: "Python",
  cpp: "C++",
};

/** Shared syntax-highlighter style, aligned with the in-app code viewer. */
const codeStyle = {
  margin: 0,
  padding: "1.25rem 1.5rem",
  background: "transparent",
  fontSize: "0.82rem",
  lineHeight: "1.6",
} as const;

/**
 * Renders a syntax-highlighted code panel with a language badge header.
 */
const CodePanel: React.FC<{ slide: PresentationSlide; compact?: boolean }> = ({
  slide,
  compact,
}) => {
  if (!slide.code) return null;
  const { language, code, caption, filePath } = slide.code;

  return (
    <div className="rounded-2xl overflow-hidden border border-cyan-500/20 bg-slate-950/80 shadow-[0_8px_40px_rgba(0,0,0,0.45)]">
      {/* File-path header — bold path sits directly above the snippet */}
      <div className="code-header flex items-center justify-between gap-3 px-4 py-2 border-b border-cyan-500/15 bg-slate-900/70">
        <strong
          className="min-w-0 truncate font-mono text-[11px] font-bold text-cyan-300"
          title={filePath}
        >
          {filePath}
        </strong>
        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          {LANG_LABEL[language] ?? language}
        </span>
      </div>

      <div
        className={`overflow-auto scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent ${
          compact ? "max-h-[40vh]" : ""
        }`}
      >
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={codeStyle}
        >
          {code}
        </SyntaxHighlighter>
      </div>

      {caption && (
        <div className="px-5 py-2.5 border-t border-slate-700/40 bg-slate-900/40">
          <span className="text-[11px] font-mono font-semibold text-emerald-400">
            {caption}
          </span>
        </div>
      )}
    </div>
  );
};

/** Speaker-note ("Komentarz") panel. */
const NotePanel: React.FC<{ note: string }> = ({ note }) => (
  <div className="mt-1 flex gap-3 rounded-xl border border-slate-700/40 bg-slate-900/40 px-4 py-3">
    <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-cyan-400/70 mt-0.5">
      Komentarz
    </span>
    <p className="text-[13px] text-slate-400 leading-relaxed italic">{note}</p>
  </div>
);

/** Horizontal pipeline diagram rendered as connected pills. */
const FlowDiagram: React.FC<{ steps: string[] }> = ({ steps }) => (
  <div className="flex flex-wrap items-center gap-2">
    {steps.map((step, i) => (
      <React.Fragment key={step}>
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 + i * 0.1 }}
          className="px-3.5 py-2 rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 text-sm font-semibold text-cyan-100 shadow-[0_0_15px_rgba(34,211,238,0.1)]"
        >
          {step}
        </motion.div>
        {i < steps.length - 1 && (
          <ArrowRight className="w-4 h-4 text-cyan-500/60 shrink-0" />
        )}
      </React.Fragment>
    ))}
  </div>
);

/**
 * Renders the body of a non-live (concept) slide based on its variant.
 */
const SlideBody: React.FC<{ slide: PresentationSlide }> = ({ slide }) => {
  // ── Title slide ──────────────────────────────────────────
  if (slide.variant === "title") {
    return (
      <div className="flex flex-col items-center text-center gap-6 max-w-3xl">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
            {slide.kicker}
          </span>
        </div>

        <h1 className="text-5xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent leading-tight">
          {slide.title}
        </h1>

        {slide.subtitle && (
          <p className="text-lg md:text-xl text-slate-300/90 font-medium">
            {slide.subtitle}
          </p>
        )}

        {slide.authors && (
          <div className="mt-2 flex flex-col items-center gap-1">
            <span className="text-[11px] uppercase tracking-widest text-slate-500 font-bold">
              Autorzy
            </span>
            <div className="flex items-center gap-3 text-base font-semibold text-white">
              {slide.authors.map((a, i) => (
                <React.Fragment key={a}>
                  {i > 0 && <span className="text-slate-600">•</span>}
                  <span>{a}</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {slide.repo && (
          <div className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700/50 bg-slate-900/50 text-sm text-slate-300">
            <FolderGit2 className="w-4 h-4 text-slate-400" />
            <span className="font-mono">{slide.repo}</span>
          </div>
        )}
      </div>
    );
  }

  // ── Closing slide ────────────────────────────────────────
  if (slide.variant === "closing") {
    return (
      <div className="flex flex-col items-center text-center gap-8 max-w-2xl">
        <h1 className="text-5xl md:text-7xl font-black tracking-tight bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
          {slide.title}
        </h1>
        {slide.subtitle && (
          <p className="text-2xl text-slate-300 font-light">{slide.subtitle}</p>
        )}
        {slide.repo && (
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-cyan-500/25 bg-cyan-500/5 text-base text-cyan-200">
            <FolderGit2 className="w-5 h-5" />
            <span className="font-mono">{slide.repo}</span>
          </div>
        )}
      </div>
    );
  }

  // ── Table slide ──────────────────────────────────────────
  if (slide.variant === "table" && slide.table) {
    const { headers, rows } = slide.table;
    return (
      <div className="w-full max-w-5xl">
        <div className="rounded-2xl overflow-hidden border border-slate-700/50 bg-slate-950/50">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {headers.map((h) => (
                  <th
                    key={h}
                    className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-cyan-300 bg-slate-900/70 border-b border-cyan-500/20"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr
                  key={ri}
                  className="border-b border-slate-800/50 last:border-0"
                >
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className="px-3 py-2.5 text-slate-300 font-medium"
                    >
                      {cell && (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-cyan-500/50" />
                          {cell}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {slide.note && <NotePanel note={slide.note} />}
      </div>
    );
  }

  // ── Content slide (bullets / flow / code) ────────────────
  const hasCode = !!slide.code;
  const hasBullets = !!slide.bullets?.length;

  return (
    <div className="w-full max-w-6xl flex flex-col gap-6">
      <div
        className={`grid gap-8 items-start ${
          hasCode && hasBullets ? "lg:grid-cols-2" : "grid-cols-1"
        }`}
      >
        {/* Left: bullets + flow */}
        {(hasBullets || slide.flow) && (
          <div className="flex flex-col gap-5">
            {slide.flow && <FlowDiagram steps={slide.flow} />}

            {hasBullets && (
              <ul className="flex flex-col gap-3.5">
                {slide.bullets!.map((b, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.08 }}
                    className="flex items-start gap-3"
                  >
                    <span className="mt-1.5 shrink-0 w-2 h-2 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                    <span className="text-[15px] md:text-base text-slate-200 leading-relaxed">
                      {b}
                    </span>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Right: code */}
        {hasCode && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={hasBullets ? "" : "max-w-3xl w-full mx-auto"}
          >
            <CodePanel slide={slide} />
          </motion.div>
        )}
      </div>

      {slide.note && <NotePanel note={slide.note} />}

      {slide.repo && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <FolderGit2 className="w-4 h-4" />
          <span className="font-mono">{slide.repo}</span>
        </div>
      )}
    </div>
  );
};

/** Shared bottom control bar (navigation + autoplay + progress dots). */
const ControlBar: React.FC = () => {
  const {
    currentIndex,
    totalSlides,
    isAutoPlaying,
    nextSlide,
    prevSlide,
    jumpToSlide,
    toggleAutoPlay,
  } = usePresentationStore();

  return (
    <div className="mx-auto max-w-4xl rounded-2xl bg-slate-950/85 border border-slate-700/50 shadow-[0_-8px_40px_rgba(0,0,0,0.5)] px-5 py-3 backdrop-blur-xl">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1 flex-wrap mb-3">
        {PRESENTATION_SLIDES.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => jumpToSlide(idx)}
            title={`Slajd ${s.id}: ${s.title}`}
            className={`h-[3px] rounded-full transition-all duration-300 cursor-pointer hover:bg-cyan-300 ${
              idx === currentIndex
                ? "w-6 bg-cyan-400"
                : idx < currentIndex
                  ? "w-2 bg-cyan-600/60"
                  : "w-1.5 bg-slate-700/70"
            }`}
          />
        ))}
      </div>

      <div className="flex items-center justify-between gap-4">
        <span className="text-xs text-slate-500 font-mono w-16">
          {currentIndex + 1} / {totalSlides}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Poprzedni (←)"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-xs font-semibold hidden sm:inline">Wstecz</span>
          </button>

          <button
            onClick={toggleAutoPlay}
            className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 transition-all active:scale-95"
            title={
              isAutoPlaying
                ? "Zatrzymaj autoodtwarzanie (Spacja)"
                : "Autoodtwarzanie (Spacja)"
            }
          >
            {isAutoPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
          </button>

          <button
            onClick={nextSlide}
            disabled={currentIndex >= totalSlides - 1}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Następny (→)"
          >
            <span className="text-xs font-semibold hidden sm:inline">Dalej</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <span className="text-[10px] text-slate-600 font-medium w-16 text-right hidden sm:block">
          ← → spacja
        </span>
      </div>
    </div>
  );
};

/**
 * Renders the presentation mode slide-deck overlay.
 */
export const PresentationOverlay: React.FC = () => {
  const { isActive, currentIndex, totalSlides, direction, nextSlide, prevSlide, jumpToSlide, toggleAutoPlay, stopPresentation } =
    usePresentationStore();
  const isAutoPlaying = usePresentationStore((s) => s.isAutoPlaying);

  const navigate = useNavigate();
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const slide = PRESENTATION_SLIDES[currentIndex];
  const isLive = !!slide?.route;

  // Whether the live code overlay is expanded (collapsed by default to reveal viz)
  const [showCode, setShowCode] = useState(false);
  useEffect(() => {
    setShowCode(false);
  }, [currentIndex]);

  // Navigate to the live visualization route for algorithm slides
  useEffect(() => {
    if (!isActive || !slide?.route) return;
    navigate(slide.route);
  }, [isActive, slide?.route, navigate]);

  // Trigger the visualization playback for the active algorithm slide.
  //  • grid  → GridStage auto-runs + auto-plays on mount (nothing to do)
  //  • graphs → AlgorithmViewer auto-runs + plays
  //  • trees → AlgorithmViewer pre-loads the trace; just press play
  //  • sorting/searching/dp → trigger the editor Run button
  useEffect(() => {
    if (!isActive || !slide?.route) return;
    const category = slide.categoryId || "";

    const timer = setTimeout(() => {
      if (category === "trees") {
        try {
          globalEngine.play();
        } catch {
          /* trace may still be loading — harmless */
        }
      } else if (RUN_TRIGGER_CATEGORIES.includes(category)) {
        const runBtn = document.getElementById(
          "run-code-btn",
        ) as HTMLButtonElement | null;
        if (runBtn && !runBtn.disabled) runBtn.click();
      }
    }, 1600);
    return () => clearTimeout(timer);
  }, [isActive, slide?.route, slide?.categoryId]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isActive) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          e.preventDefault();
          stopPresentation();
          break;
        case "ArrowRight":
        case "PageDown":
          e.preventDefault();
          nextSlide();
          break;
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          prevSlide();
          break;
        case " ":
          e.preventDefault();
          toggleAutoPlay();
          break;
        case "Home":
          e.preventDefault();
          jumpToSlide(0);
          break;
        case "End":
          e.preventDefault();
          jumpToSlide(totalSlides - 1);
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isActive,
    nextSlide,
    prevSlide,
    toggleAutoPlay,
    jumpToSlide,
    stopPresentation,
    totalSlides,
  ]);

  // Autoplay timer
  useEffect(() => {
    if (!isActive || !isAutoPlaying) {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
      return;
    }
    autoplayRef.current = setInterval(() => {
      const { currentIndex: idx, totalSlides: total } =
        usePresentationStore.getState();
      if (idx >= total - 1) {
        usePresentationStore.setState({ isAutoPlaying: false });
      } else {
        usePresentationStore.getState().nextSlide();
      }
    }, AUTOPLAY_SECONDS * 1000);
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [isActive, isAutoPlaying, currentIndex]);

  if (!isActive || !slide) return null;

  const progress = ((currentIndex + 1) / totalSlides) * 100;

  // ── Shared top bar (progress + badge + close) ────────────
  const topBar = (
    <>
      <div className="relative h-1.5 w-full bg-slate-900/60 pointer-events-none">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500"
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 22 }}
        />
      </div>

      <div className="flex items-center justify-between px-6 pt-4 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/70 border border-slate-700/50 pointer-events-auto backdrop-blur-md">
          <Monitor className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
            Tryb prezentacji
          </span>
        </div>

        <button
          onClick={stopPresentation}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 border border-slate-700/50 hover:border-red-400/30 transition-all pointer-events-auto backdrop-blur-md bg-slate-900/70"
          title="Zamknij (Esc)"
        >
          <X className="w-4 h-4" />
          <span className="text-xs font-semibold">Zamknij</span>
        </button>
      </div>
    </>
  );

  // ── Live algorithm slide: light overlay over the running visualization ──
  if (isLive) {
    return createPortal(
      <AnimatePresence>
        <motion.div
          key="presentation-live"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[9990] flex flex-col pointer-events-none"
        >
          {topBar}

          {/* Centered title card */}
          <div className="flex justify-center px-6 pt-3 pointer-events-none">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ type: "spring", stiffness: 220, damping: 24 }}
                className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-950/80 border border-cyan-500/25 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl pointer-events-auto"
              >
                <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-300 font-black text-sm">
                  {slide.id}
                </span>
                <div className="flex flex-col">
                  {slide.kicker && (
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-400/80">
                      {slide.kicker}
                    </span>
                  )}
                  <h2 className="text-lg font-black tracking-tight text-white leading-tight">
                    {slide.title}
                  </h2>
                </div>
                {slide.complexity && (
                  <span className="ml-2 px-3 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/10 border border-emerald-500/25 text-emerald-300">
                    {slide.complexity}
                  </span>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Spacer so the visualization underneath stays interactive/visible */}
          <div className="flex-1" />

          {/* Collapsible code panel (bottom-left) */}
          {slide.code && showCode && (
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              className="absolute left-6 bottom-36 w-[min(440px,42vw)] pointer-events-auto"
            >
              <CodePanel slide={slide} compact />
            </motion.div>
          )}

          {/* Bottom area: note + controls */}
          <div className="px-6 pb-5 flex flex-col gap-2 pointer-events-none">
            {slide.note && (
              <div className="mx-auto max-w-4xl w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/50 backdrop-blur-xl pointer-events-auto">
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-cyan-400/70">
                  Komentarz
                </span>
                <p className="text-[12.5px] text-slate-300 leading-snug italic line-clamp-2">
                  {slide.note}
                </p>
                {slide.code && (
                  <button
                    onClick={() => setShowCode((v) => !v)}
                    className={`ml-auto shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
                      showCode
                        ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-200"
                        : "bg-slate-800/60 border-slate-700/50 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/30"
                    }`}
                    title="Pokaż / ukryj kod"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    {showCode ? "Ukryj kod" : "Kod"}
                  </button>
                )}
              </div>
            )}
            <div className="pointer-events-auto">
              <ControlBar />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>,
      document.body,
    );
  }

  // ── Concept slide: opaque full-screen glass deck ─────────
  return createPortal(
    <AnimatePresence>
      <motion.div
        key="presentation-deck"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[9990] flex flex-col"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(34,211,238,0.08), transparent 45%), radial-gradient(circle at 80% 80%, rgba(99,102,241,0.10), transparent 45%), rgba(6,10,22,0.97)",
          backdropFilter: "blur(24px)",
        }}
      >
        {topBar}

        {/* Slide stage */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 md:px-16 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={slide.id}
              custom={direction}
              initial={{ opacity: 0, x: direction * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -60 }}
              transition={{ type: "spring", stiffness: 200, damping: 26 }}
              className="w-full flex flex-col items-center justify-center gap-7"
            >
              {/* Slide header (non-title/closing variants) */}
              {slide.variant !== "title" && slide.variant !== "closing" && (
                <div className="w-full max-w-6xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-300 font-black text-sm">
                      {slide.id}
                    </span>
                    <div className="flex flex-col">
                      {slide.kicker && (
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400/80">
                          {slide.kicker}
                        </span>
                      )}
                      <h2 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                        {slide.title}
                      </h2>
                    </div>
                  </div>

                  {slide.complexity && (
                    <span className="hidden md:inline-flex px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 shrink-0">
                      {slide.complexity}
                    </span>
                  )}
                </div>
              )}

              <SlideBody slide={slide} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom control bar */}
        <div className="px-6 pb-5">
          <ControlBar />
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
};

export default PresentationOverlay;
