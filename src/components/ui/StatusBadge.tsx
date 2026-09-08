import type { ReactNode } from "react";
import { cn } from "@/utils/format";
import type { OrderStatus } from "@/types";
import { useTranslation } from "react-i18next";

const statusStyles: Record<OrderStatus, string> = {
  new: "bg-primary-muted text-primary",
  preparing: "bg-warning-muted text-warning",
  ready: "bg-success-muted text-success",
  completed: "bg-info-muted text-info",
  cancelled: "bg-danger-muted text-danger",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useTranslation();
  const labels: Record<OrderStatus, string> = {
    new: t("orders.statusNew"),
    preparing: t("orders.statusPreparing"),
    ready: t("orders.statusReady"),
    completed: t("orders.statusCompleted"),
    cancelled: t("orders.statusCancelled"),
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", statusStyles[status])}>
      {labels[status]}
    </span>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "danger" | "warning" | "info";
}) {
  const styles = {
    neutral: "bg-surface-2 text-muted border border-border",
    success: "bg-success-muted text-success",
    danger: "bg-danger-muted text-danger",
    warning: "bg-warning-muted text-warning",
    info: "bg-info-muted text-info",
  };
  return <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", styles[tone])}>{children}</span>;
}
