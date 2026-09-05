import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/utils/format";
import { IconButton } from "@/components/ui/IconButton";

export function Drawer({
  open,
  title,
  children,
  onClose,
  footer,
  width = "w-full max-w-[420px]",
}: {
  open: boolean;
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
  footer?: React.ReactNode;
  width?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div className={cn("fixed inset-0 z-40", open ? "pointer-events-auto" : "pointer-events-none")}>
      <button
        type="button"
        aria-label="Close drawer"
        onClick={onClose}
        className={cn("absolute inset-0 bg-black/50 transition", open ? "opacity-100" : "opacity-0")}
      />
      <aside
        className={cn(
          "absolute inset-y-0 right-0 flex h-full flex-col border-l border-border bg-surface shadow-card transition-transform duration-300",
          width,
          open ? "translate-x-0" : "translate-x-full",
        )}
        aria-hidden={!open}
        inert={!open ? true : undefined}
      >
        {title ? (
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-base font-semibold">{title}</h2>
            <IconButton label="Close drawer" onClick={onClose}>
              <X className="h-4 w-4" />
            </IconButton>
          </div>
        ) : null}
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer ? <div className="border-t border-border p-4">{footer}</div> : null}
      </aside>
    </div>
  );
}
