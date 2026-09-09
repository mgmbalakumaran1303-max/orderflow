import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { languages } from "@/i18n";
import { useSettingsStore } from "@/stores/settingsStore";
import { useUiStore } from "@/stores/uiStore";
import { cn } from "@/utils/format";
import type { AppLanguage } from "@/types";

// Keep in sync with the `w-56` menu width below.
const MENU_WIDTH_PX = 224;
const VIEWPORT_MARGIN_PX = 8;

export function LanguageSelect() {
  const { t, i18n } = useTranslation();
  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const toast = useUiStore((s) => s.toast);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [align, setAlign] = useState<"left" | "right">("left");

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLLIElement | null>>([]);

  const selected = languages.find((item) => item.code === language) ?? languages[0];

  function openMenu() {
    setActiveIndex(Math.max(0, languages.findIndex((item) => item.code === language)));
    // Prefer aligning the menu's left edge with the trigger, but flip to the
    // right edge when that would overflow the viewport (e.g. near the right
    // side of the header on narrow screens).
    const rect = rootRef.current?.getBoundingClientRect();
    setAlign(rect && rect.left + MENU_WIDTH_PX > window.innerWidth - VIEWPORT_MARGIN_PX ? "right" : "left");
    setOpen(true);
  }

  function closeMenu(returnFocus: boolean) {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }

  async function choose(code: AppLanguage) {
    if (code !== language) {
      await setLanguage(code);
      // Read the label fresh off the i18n instance: `t` from this closure can
      // still be bound to the language active before the switch resolved.
      toast("success", i18n.t("notifications.languageChanged"));
    }
    closeMenu(true);
  }

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Move real DOM focus to the highlighted option whenever the menu opens or
  // the highlight moves, so keyboard users get a visible native focus ring.
  useEffect(() => {
    if (open) optionRefs.current[activeIndex]?.focus();
  }, [open, activeIndex]);

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openMenu();
    }
  }

  function onOptionKeyDown(event: KeyboardEvent<HTMLLIElement>, index: number) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((index + 1) % languages.length);
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((index - 1 + languages.length) % languages.length);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        void choose(languages[index].code);
        break;
      case "Escape":
        event.preventDefault();
        closeMenu(true);
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
        break;
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("personalization.language")}
        onClick={() => (open ? closeMenu(false) : openMenu())}
        onKeyDown={onTriggerKeyDown}
        className="flex h-11 items-center gap-1.5 rounded-lg border border-border bg-card px-3 transition-colors duration-150 hover:bg-card-hover"
      >
        <span className="text-sm font-semibold text-foreground">{selected.code.toUpperCase()}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted transition-transform duration-150", open && "rotate-180")} aria-hidden />
      </button>

      <ul
        role="listbox"
        aria-label={t("personalization.language")}
        aria-hidden={!open}
        className={cn(
          "absolute top-[calc(100%+6px)] z-50 w-56 rounded-xl border border-border bg-card py-1.5 shadow-card transition-all duration-150 ease-out",
          align === "left" ? "left-0 origin-top-left" : "right-0 origin-top-right",
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0",
        )}
      >
        {languages.map((item, index) => {
          const isSelected = item.code === language;
          return (
            <li
              key={item.code}
              ref={(el) => {
                optionRefs.current[index] = el;
              }}
              role="option"
              aria-selected={isSelected}
              tabIndex={-1}
              onClick={() => void choose(item.code)}
              onKeyDown={(event) => onOptionKeyDown(event, index)}
              onMouseEnter={() => setActiveIndex(index)}
              className={cn(
                "mx-1.5 flex h-10 cursor-pointer items-center gap-2.5 rounded-lg px-3 transition-colors duration-150 hover:bg-card-hover",
                isSelected && "bg-primary-muted",
              )}
            >
              <Check className={cn("h-3.5 w-3.5 shrink-0 text-primary", !isSelected && "invisible")} aria-hidden />
              <span className="w-6 shrink-0 text-xs text-muted">{item.code.toUpperCase()}</span>
              <span className={cn("truncate text-sm text-foreground", isSelected && "font-semibold text-primary")}>
                {item.native}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
