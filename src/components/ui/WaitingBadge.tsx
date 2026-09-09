import { Clock } from "lucide-react";
import { getWaitingSeverity, waitingLabel } from "@/utils/format";
import { cn } from "@/utils/format";

const severityStyles = {
  normal: "bg-surface-2 text-muted border border-border",
  warning: "bg-warning-muted text-warning",
  critical: "bg-danger-muted text-danger",
};

export function WaitingBadge({ createdAt }: { createdAt: string }) {
  const severity = getWaitingSeverity(createdAt);
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", severityStyles[severity])}>
      <Clock className="h-3 w-3" />
      {waitingLabel(createdAt)}
    </span>
  );
}
