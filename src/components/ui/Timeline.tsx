import { formatRelative } from "@/utils/format";
import { cn } from "@/utils/format";
import type { TimelineEvent } from "@/types";

export function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="space-y-3">
      {events.map((event, index) => {
        const done = Boolean(event.at);
        const current = done && events.slice(index + 1).every((item) => !item.at);
        return (
          <li key={`${event.label}-${index}`} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "mt-0.5 h-2.5 w-2.5 rounded-full",
                  current && "bg-primary",
                  done && !current && "bg-success",
                  !done && "bg-border-strong",
                )}
              />
              {index < events.length - 1 ? <span className="mt-1 w-px flex-1 bg-border" /> : null}
            </div>
            <div className="pb-2">
              <p className={cn("text-sm", done ? "text-foreground" : "text-subtle")}>{event.label}</p>
              <p className="text-xs text-muted">{event.at ? formatRelative(event.at) : "--"}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
