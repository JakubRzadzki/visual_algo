import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useUIStore } from "./store/uiStore";
import Navbar from "./components/layout/Navbar";
import AmbientGraph from "./components/background/AmbientGraph";
import AriaLiveRegion from "./components/a11y/AriaLiveRegion";
import Dashboard from "./components/dashboard/Dashboard";
import AlgorithmViewer from "./components/viewer/AlgorithmViewer";
import { ToastProvider } from "./components/hud/Toast";
import ShareLoader from "./pages/ShareLoader";

// Interactive Tutorial onboarding imports
import { TutorialOverlay } from "./components/tutorial/TutorialOverlay";
import { useTutorialStore } from "./store/tutorialStore";
import { tutorialSteps } from "./data/tutorialSteps";

// Presentation Mode imports
import { PresentationOverlay } from "./components/presentation/PresentationOverlay";

export default function App() {
  const theme = useUIStore((state) => state.theme);
  const location = useLocation();
  const { isActive, startTutorial, stopTutorial } = useTutorialStore();

  // Sync light-mode class to <html> and <body> on mount and theme change
  useEffect(() => {
    const els = [document.documentElement, document.body];
    els.forEach((el) => {
      if (theme === "light") {
        el.classList.add("light-mode");
      } else {
        el.classList.remove("light-mode");
      }
    });
  }, [theme]);

  // Route-cleaner: Stop/reset the tutorial if page/route transitions occur to prevent orphaned spotlight cutouts
  useEffect(() => {
    if (isActive) {
      stopTutorial();
    }
  }, [location.pathname]);

  // Onboarding: Automatically launch the quick tour for fresh new visualizer users
  useEffect(() => {
    const hasSeen = localStorage.getItem("visual-algo-has-seen-tutorial");
    if (!hasSeen) {
      const onboardTimer = setTimeout(() => {
        startTutorial(tutorialSteps);
        // Mark as seen so we don't re-trigger automatically on subsequent loads
        localStorage.setItem("visual-algo-has-seen-tutorial", "true");
      }, 1000);
      return () => clearTimeout(onboardTimer);
    }
  }, [startTutorial]);

  return (
    <ToastProvider>
      <div
        className="relative min-h-screen cursor-default"
        style={{
          backgroundColor: "var(--bg-primary)",
          color: "var(--text-primary)",
          transition: "background-color 0.3s ease, color 0.3s ease",
        }}
      >
        <AriaLiveRegion />
        {/* Dynamic Floating Mesh */}
        <AmbientGraph />

        <Navbar />
        <TutorialOverlay />
        <PresentationOverlay />

        <Routes>
          {/* Landing page — Algorithm Catalog */}
          <Route path="/" element={<Dashboard />} />
          {/* Algorithm Viewer — full visualisation workspace */}
          <Route path="/algo/:category/:id" element={<AlgorithmViewer />} />
          {/* Shared Snapshot Loader */}
          <Route path="/share/:snapshotId" element={<ShareLoader />} />
        </Routes>
      </div>
    </ToastProvider>
  );
}
