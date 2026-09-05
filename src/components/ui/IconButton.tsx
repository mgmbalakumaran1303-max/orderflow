import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/format";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
}

export function IconButton({ label, className, children, ...props }: Props) {
  return (
    <button
      aria-label={label}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-card-hover hover:text-foreground transition",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
