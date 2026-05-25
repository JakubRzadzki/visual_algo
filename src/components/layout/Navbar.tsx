import { useLocation, Link, useNavigate } from "react-router-dom";
import { useUIStore } from "../../store/uiStore";
import { Menu, Zap, Home, Sun, Moon, HelpCircle, Monitor } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTutorialStore } from "../../store/tutorialStore";
import { tutorialSteps } from "../../data/tutorialSteps";
import { usePresentationStore } from "../../store/presentationStore";

export default function Navbar() {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);
  const theme = useUIStore((state) => state.theme);
  const toggleTheme = useUIStore((state) => state.toggleTheme);
  const language = useUIStore((state) => state.language);
  const startTutorial = useTutorialStore((state) => state.startTutorial);
  const startPresentation = usePresentationStore(
    (state) => state.startPresentation,
  );
  const isPresentationActive = usePresentationStore((state) => state.isActive);

  const location = useLocation();
  const navigate = useNavigate();
  const isVisualizer = location.pathname.startsWith("/algo");

  return (
    <nav
      className="fixed top-0 left-0 right-0 h-16 backdrop-blur-xl z-50 flex items-center px-6 justify-between shadow-xl"
      style={{
        backgroundColor: "var(--navbar-bg)",
        borderBottom: "1px solid var(--navbar-border)",
        transition: "background-color 0.3s ease, border-color 0.3s ease",
      }}
    >
      <div className="flex items-center gap-4">
        {isVisualizer && (
          <button
            onClick={toggleSidebar}
            className={`p-2 rounded-lg transition-all border ${
              isSidebarOpen
                ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                : "border-transparent hover:bg-white/5"
            }`}
            style={{ color: isSidebarOpen ? undefined : "var(--text-secondary)" }}
            title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <Link
          to="/"
          data-tutorial-step="navbar-home"
          className="font-bold text-lg luminous-text flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Zap className="w-5 h-5 animate-pulse" style={{ color: "var(--accent-cyan)" }} />
          <span
            className="bg-gradient-to-r bg-clip-text text-transparent"
            style={{
              backgroundImage: theme === "dark"
                ? "linear-gradient(to right, #fff, #e2e8f0, #22d3ee)"
                : "linear-gradient(to right, #0d1117, #334155, #0891b2)",
            }}
          >
            {language === "en"
              ? "Algorithm Visualizer EDVR"
              : "Wizualizator Algorytmów EDVR"}
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {/* Help & Tutorial Onboarding Trigger */}
        <button
          onClick={() => startTutorial(tutorialSteps)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-cyan-500/10 border border-cyan-500/20 hover:border-cyan-500/30 transition-all shadow-[0_0_10px_rgba(6,182,212,0.15)] active:scale-95 cursor-pointer mr-1"
          style={{ color: "var(--accent-cyan)" }}
          title={
            language === "en"
              ? "Start Interactive Tour"
              : "Uruchom interaktywny przewodnik"
          }
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{language === "en" ? "Quick Tour" : "Przewodnik"}</span>
        </button>

        {/* Presentation Mode Trigger */}
        <button
          onClick={startPresentation}
          disabled={isPresentationActive}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all active:scale-95 cursor-pointer mr-1 ${
            isPresentationActive
              ? "text-emerald-300/60 bg-emerald-500/5 border-emerald-500/15 cursor-not-allowed"
              : "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
          }`}
          title={
            language === "en"
              ? "Start Presentation Mode — Auto-showcase all algorithms"
              : "Tryb prezentacji — Automatyczny pokaz algorytmów"
          }
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>{language === "en" ? "Present" : "Prezentacja"}</span>
        </button>

        {isVisualizer && (
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-transparent transition-all"
            style={{ color: "var(--text-secondary)" }}
          >
            <Home className="w-3.5 h-3.5" />
            <span>{language === "en" ? "Catalog" : "Katalog"}</span>
          </button>
        )}

        <div
          className="flex items-center gap-2 p-1 rounded-xl border ml-2"
          style={{
            backgroundColor: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
            borderColor: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)",
          }}
        >
          {/* Creative Theme Toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
            onClick={toggleTheme}
            className="relative w-10 h-10 flex items-center justify-center rounded-lg cursor-pointer overflow-hidden group"
            style={{
              backgroundColor: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
              border: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"}`,
              color: "var(--text-secondary)",
            }}
            title={
              theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
            }
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={theme}
                initial={{ y: 20, opacity: 0, rotate: -45 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: -20, opacity: 0, rotate: 45 }}
                transition={{ duration: 0.2 }}
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </motion.div>
            </AnimatePresence>
            <div
              className="absolute inset-0 transition-colors"
              style={{ backgroundColor: "rgba(8, 145, 178, 0)" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(8, 145, 178, 0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(8, 145, 178, 0)")}
            />
          </motion.button>

          <div className="w-[1px] h-6 mx-1" style={{ backgroundColor: theme === "dark" ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)" }} />

          <div className="flex items-center gap-1">
            <button
              onClick={() => useUIStore.getState().setLanguage("en")}
              className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                language === "en"
                  ? "bg-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                  : ""
              }`}
              style={language !== "en" ? { color: "var(--text-muted)" } : undefined}
            >
              EN
            </button>
            <button
              onClick={() => useUIStore.getState().setLanguage("pl")}
              className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                language === "pl"
                  ? "bg-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                  : ""
              }`}
              style={language !== "pl" ? { color: "var(--text-muted)" } : undefined}
            >
              PL
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
