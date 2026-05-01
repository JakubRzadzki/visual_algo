import { useState, useCallback, useEffect, createContext, useContext, useRef } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastVariant = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  detail?: string;
  variant: ToastVariant;
  exiting: boolean;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant, detail?: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a <ToastProvider>');
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

const AUTO_DISMISS_MS = 4000;
const EXIT_ANIMATION_MS = 300;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    // Start exit animation
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    // Remove after animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, EXIT_ANIMATION_MS);
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'info', detail?: string) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, detail, variant, exiting: false }]);

      // Auto-dismiss timer
      const timer = setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
      timersRef.current.set(id, timer);
    },
    [dismiss],
  );

  // Cleanup timers on unmount
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// ─── Container ────────────────────────────────────────────────────────────────

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      id="toast-container"
      style={{
        position: 'fixed',
        bottom: '5.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: '0.5rem',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

// ─── Individual Toast Card ────────────────────────────────────────────────────

const VARIANT_CONFIG: Record<
  ToastVariant,
  { Icon: typeof CheckCircle2; borderColor: string; iconColor: string; glowColor: string }
> = {
  success: {
    Icon: CheckCircle2,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    iconColor: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.15)',
  },
  error: {
    Icon: XCircle,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    iconColor: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.15)',
  },
  info: {
    Icon: Info,
    borderColor: 'rgba(125, 211, 252, 0.3)',
    iconColor: '#7dd3fc',
    glowColor: 'rgba(125, 211, 252, 0.15)',
  },
};

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const { Icon, borderColor, iconColor, glowColor } = VARIANT_CONFIG[toast.variant];

  return (
    <div
      role="alert"
      style={{
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '0.875rem 1rem',
        minWidth: '300px',
        maxWidth: '420px',
        borderRadius: '0.75rem',
        border: `1px solid ${borderColor}`,
        background: 'rgba(10, 14, 26, 0.92)',
        backdropFilter: 'blur(20px)',
        boxShadow: `0 0 24px ${glowColor}, 0 8px 32px rgba(0, 0, 0, 0.4)`,
        color: '#e2e8f0',
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: '0.8125rem',
        lineHeight: '1.5',
        animation: toast.exiting
          ? `toastExit ${EXIT_ANIMATION_MS}ms ease-in forwards`
          : 'toastEnter 300ms ease-out forwards',
      }}
    >
      <Icon
        style={{
          width: '1.125rem',
          height: '1.125rem',
          color: iconColor,
          flexShrink: 0,
          marginTop: '1px',
          filter: `drop-shadow(0 0 6px ${iconColor}50)`,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontWeight: 600, color: '#f1f5f9' }}>{toast.message}</p>
        {toast.detail && (
          <p
            style={{
              margin: '0.25rem 0 0',
              fontSize: '0.75rem',
              color: '#94a3b8',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {toast.detail}
          </p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        style={{
          background: 'none',
          border: 'none',
          padding: '2px',
          cursor: 'pointer',
          color: '#475569',
          flexShrink: 0,
          transition: 'color 150ms',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#94a3b8')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
        aria-label="Dismiss notification"
      >
        <X style={{ width: '0.875rem', height: '0.875rem' }} />
      </button>

      {/* Inline keyframes — rendered once per toast, browser deduplicates */}
      <style>{`
        @keyframes toastEnter {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes toastExit {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(8px) scale(0.96);
          }
        }
      `}</style>
    </div>
  );
}
