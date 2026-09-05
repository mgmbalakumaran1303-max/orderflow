import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useUiStore } from "@/stores/uiStore";
import { cn } from "@/utils/format";

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const tones = {
  success: "border-success/30 bg-success-muted text-success",
  error: "border-danger/30 bg-danger-muted text-danger",
  warning: "border-warning/30 bg-warning-muted text-warning",
  info: "border-info/30 bg-info-muted text-info",
};

export function ToastViewport() {
  const toasts = useUiStore((s) => s.toasts);
  const dismiss = useUiStore((s) => s.dismissToast);
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[60] flex w-[min(100%-2rem,360px)] flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = icons[toast.tone];
        return (
          <div
            key={toast.id}
            className={cn("pointer-events-auto flex gap-3 rounded-xl border bg-card p-3 shadow-card", tones[toast.tone])}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{toast.title}</p>
              {toast.description ? <p className="text-xs text-muted">{toast.description}</p> : null}
            </div>
            <button type="button" aria-label="Dismiss" onClick={() => dismiss(toast.id)}>
              <X className="h-4 w-4 text-muted" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
