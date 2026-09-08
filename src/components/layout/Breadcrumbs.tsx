import { Link } from "react-router-dom";
import { cn } from "@/utils/format";

export function Breadcrumbs({ items }: { items: Array<{ label: string; to?: string }> }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-1 text-xs text-muted">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-center gap-1">
          {index > 0 ? <span aria-hidden>/</span> : null}
          {item.to ? (
            <Link to={item.to} className="hover:text-primary">
              {item.label}
            </Link>
          ) : (
            <span className={cn("text-foreground")}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
