import { formatDistanceToNow, format } from "date-fns";
import type { OrderSource, OrderStatus, UserRole } from "@/types";

export function formatEuro(value: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export function formatRelative(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true }).replace("about ", "");
}

export function formatDateLabel(date: Date): string {
  return format(date, "EEEE, MMM d, yyyy");
}

export function sourceLabel(source: OrderSource): string {
  const labels: Record<OrderSource, string> = {
    "uber-eats": "Uber Eats",
    whatsapp: "WhatsApp",
    website: "Website",
    wolt: "Wolt",
    other: "Other",
  };
  return labels[source];
}

export function statusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    new: "New",
    preparing: "Preparing",
    ready: "Ready",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return labels[status];
}

export function roleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    admin: "Restaurant Admin",
    manager: "Manager",
    staff: "Staff",
    viewer: "Viewer",
  };
  return labels[role];
}

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function itemCountLabel(count: number): string {
  return `${count} ${count === 1 ? "item" : "items"}`;
}
