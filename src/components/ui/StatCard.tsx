import type { ReactNode } from "react";
import { cn } from "@/utils/format";

export function StatCard({
  label,
  value,
  trend,
  icon,
  tone = "primary",
}: {
  label: string;
  value: string | number;
  trend?: string;
  icon: ReactNode;
  tone?: "primary" | "warning" | "success" | "info";
}) {
  const tones = {
    primary: "text-primary bg-primary-muted",
    warning: "text-warning bg-warning-muted",
    success: "text-success bg-success-muted",
    info: "text-info bg-info-muted",
  };
  const up = trend?.startsWith("+");
  const down = trend?.startsWith("-");
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-card transition hover:bg-card-hover">
      <div className={cn("mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg", tones[tone])}>{icon}</div>
      <p className="text-sm text-muted">{label}</p>
      <div className="mt-1 flex items-end justify-between">
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        {trend ? (
          <p className={cn("text-xs", up && "text-success", down && "text-danger", !up && !down && "text-muted")}>{trend}</p>
        ) : null}
      </div>
    </div>
  );
}
