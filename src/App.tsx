import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useUIStore } from './store/uiStore';
import Navbar from './components/layout/Navbar';
import AmbientGraph from './components/background/AmbientGraph';
import AriaLiveRegion from './components/a11y/AriaLiveRegion';
import Dashboard from './components/dashboard/Dashboard';
import AlgorithmViewer from './components/viewer/AlgorithmViewer';
import { ToastProvider } from './components/hud/Toast';
import ShareLoader from './pages/ShareLoader';

// Interactive Tutorial onboarding imports
import { TutorialOverlay } from './components/tutorial/TutorialOverlay';
import { useTutorialStore } from './store/tutorialStore';
import { tutorialSteps } from './data/tutorialSteps';

// Presentation Mode imports
import { PresentationOverlay } from './components/presentation/PresentationOverlay';

export default function App() {
  const theme = useUIStore(state => state.theme);
  const location = useLocation();
  const { isActive, startTutorial, stopTutorial } = useTutorialStore();

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, [theme]);

  // Route-cleaner: Stop/reset the tutorial if page/route transitions occur to prevent orphaned spotlight cutouts
  useEffect(() => {
    if (isActive) {
      stopTutorial();
    }
  }, [location.pathname]);

  // Onboarding: Automatically launch the quick tour for fresh new visualizer users
  useEffect(() => {
    const hasSeen = localStorage.getItem('visual-algo-has-seen-tutorial');
    if (!hasSeen) {
      const onboardTimer = setTimeout(() => {
        startTutorial(tutorialSteps);
        // Mark as seen so we don't re-trigger automatically on subsequent loads
        localStorage.setItem('visual-algo-has-seen-tutorial', 'true');
      }, 1000);
      return () => clearTimeout(onboardTimer);
    }
  }, [startTutorial]);

  return (
    <ToastProvider>
      <div className="relative min-h-screen bg-glacier-bg text-slate-200 selection:bg-ice-blue/30 selection:text-ice-blue cursor-default">
        <AriaLiveRegion />
        {/* Dynamic Floating Mesh */}
        <AmbientGraph />
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0a0e1a]/80 via-[#0f1524]/60 to-[#0a0e1a]/80 pointer-events-none" />

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
