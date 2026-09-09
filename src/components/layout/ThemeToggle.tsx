import { Moon, Sun } from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { IconButton } from "@/components/ui/IconButton";
import { useSettingsStore } from "@/stores/settingsStore";
import { useUiStore } from "@/stores/uiStore";

// Ignore a second click landing within this window of the first — a
// double-click (or a fast double-tap) should read as one user action, not
// two independent toggles each firing its own toast.
const REPEAT_GUARD_MS = 400;

export function ThemeToggle() {
  const { t } = useTranslation();
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const toast = useUiStore((s) => s.toast);
  const lastToggleRef = useRef(0);

  return (
    <IconButton
      label={theme === "light" ? t("personalization.dark") : t("personalization.light")}
      onClick={() => {
        const now = Date.now();
        if (now - lastToggleRef.current < REPEAT_GUARD_MS) return;
        lastToggleRef.current = now;

        // Read the live theme at click time instead of closing over the value
        // from the last render, so this can't target a stale value either.
        const current = useSettingsStore.getState().theme;
        const next = current === "light" ? "dark" : "light";
        setTheme(next);
        toast("success", t("notifications.themeChanged"));
      }}
    >
      {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </IconButton>
  );
}
