import { Search } from "lucide-react";
import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/utils/format";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  wrapperClassName?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, Props>(function SearchInput(
  { wrapperClassName, className, ...props },
  ref,
) {
  return (
    <label className={cn("relative block", wrapperClassName)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
      <input
        ref={ref}
        className={cn(
          "h-9 w-full rounded-lg border border-border bg-surface-2 pl-9 pr-3 text-sm text-foreground placeholder:text-subtle outline-none focus:border-primary",
          className,
        )}
        {...props}
      />
    </label>
  );
});
