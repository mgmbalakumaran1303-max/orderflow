import { Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { IconButton } from "@/components/ui/IconButton";
import { useSettingsStore } from "@/stores/settingsStore";
import { useUiStore } from "@/stores/uiStore";

export function ThemeToggle() {
  const { t } = useTranslation();
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const toast = useUiStore((s) => s.toast);
  const next = theme === "light" ? "dark" : "light";

  return (
    <IconButton
      label={next === "dark" ? t("personalization.dark") : t("personalization.light")}
      onClick={() => {
        setTheme(next);
        toast("success", t("notifications.themeChanged"));
      }}
    >
      {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </IconButton>
  );
}
