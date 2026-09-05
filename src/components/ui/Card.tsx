import type { ReactNode } from "react";
import { cn } from "@/utils/format";

interface Props {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: boolean;
}

export function Card({ children, className, hover, padding = true }: Props) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card shadow-card",
        padding && "p-4",
        hover && "transition hover:bg-card-hover",
        className,
      )}
    >
      {children}
    </div>
  );
}
