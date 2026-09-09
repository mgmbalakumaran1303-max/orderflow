import { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useUiStore, type ToastItem, type ToastTone } from "@/stores/uiStore";
import { cn } from "@/utils/format";

const DEFAULT_DURATION_MS = 5000;
const EXIT_ANIMATION_MS = 200;

const icons: Record<ToastTone, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const badgeTone: Record<ToastTone, string> = {
  success: "bg-success",
  error: "bg-danger",
  warning: "bg-warning",
  info: "bg-info",
};

const accentTone: Record<ToastTone, string> = {
  success: "border-l-success",
  error: "border-l-danger",
  warning: "border-l-warning",
  info: "border-l-info",
};

export function ToastViewport() {
  const toasts = useUiStore((s) => s.toasts);
  const dismiss = useUiStore((s) => s.dismissToast);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed right-4 top-20 z-[60] flex w-[min(100%-2rem,380px)] flex-col gap-2 sm:right-6"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
      ))}
    </div>
  );
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const { t } = useTranslation();
  const [closing, setClosing] = useState(false);
  const duration = toast.duration ?? DEFAULT_DURATION_MS;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingRef = useRef(duration);
  const startedAtRef = useRef(0);

  function requestClose() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setClosing(true);
    window.setTimeout(onDismiss, EXIT_ANIMATION_MS);
  }

  function schedule(ms: number) {
    startedAtRef.current = Date.now();
    timerRef.current = setTimeout(requestClose, ms);
  }

  useEffect(() => {
    schedule(remainingRef.current);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pause() {
    if (!timerRef.current) return;
    clearTimeout(timerRef.current);
    timerRef.current = null;
    remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startedAtRef.current));
  }

  function resume() {
    if (timerRef.current || closing) return;
    schedule(remainingRef.current);
  }

  const Icon = icons[toast.tone];

  return (
    <div
      role={toast.tone === "error" ? "alert" : undefined}
      onMouseEnter={pause}
      onMouseLeave={resume}
      className={cn(
        "pointer-events-auto flex items-start gap-3 rounded-xl border border-border border-l-4 bg-card p-3.5 shadow-card",
        accentTone[toast.tone],
        closing ? "animate-[toast-out_200ms_ease-in_forwards]" : "animate-[toast-in_220ms_ease-out]",
      )}
    >
      <span className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white", badgeTone[toast.tone])}>
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm font-semibold text-foreground">{toast.title}</p>
        {toast.description ? <p className="mt-0.5 text-xs text-muted">{toast.description}</p> : null}
      </div>
      <button
        type="button"
        aria-label={t("common.dismiss")}
        onClick={requestClose}
        className="shrink-0 rounded-md p-0.5 text-muted transition-colors hover:bg-card-hover hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
