import type { ReactNode } from "react";
import { cn } from "@/utils/format";

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: Array<{ id: T; label: string; count?: number }>;
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex gap-1 overflow-x-auto rounded-lg border border-border bg-surface-2 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition",
            value === tab.id ? "bg-primary text-white" : "text-muted hover:text-foreground",
          )}
        >
          {tab.label}
          {typeof tab.count === "number" ? ` (${tab.count})` : ""}
        </button>
      ))}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <div className="text-subtle">{icon}</div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="max-w-sm text-sm text-muted">{description}</p>
      {action}
    </div>
  );
}

export function ErrorState({
  title,
  description,
  onRetry,
  onBack,
}: {
  title: string;
  description: string;
  onRetry?: () => void;
  onBack?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="max-w-sm text-sm text-muted">{description}</p>
      <div className="flex gap-2">
        {onBack ? (
          <button type="button" className="rounded-lg border border-border px-3 py-2 text-sm" onClick={onBack}>
            Go Back
          </button>
        ) : null}
        {onRetry ? (
          <button type="button" className="rounded-lg bg-primary px-3 py-2 text-sm text-white" onClick={onRetry}>
            Retry
          </button>
        ) : null}
      </div>
    </div>
  );
}
