import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { languages } from "@/i18n";
import { useSettingsStore } from "@/stores/settingsStore";
import { useUiStore } from "@/stores/uiStore";
import type { AppLanguage } from "@/types";

export function LanguageSelect() {
  const { t } = useTranslation();
  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const toast = useUiStore((s) => s.toast);
  const [open, setOpen] = useState(false);

  async function choose(code: AppLanguage) {
    await setLanguage(code);
    setOpen(false);
    toast("success", t("notifications.languageChanged"));
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={t("personalization.language")}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 items-center gap-1 rounded-lg border border-border bg-card px-2.5 text-xs font-semibold"
      >
        {language.toUpperCase()}
        <ChevronDown className="h-3.5 w-3.5 text-muted" />
      </button>
      {open ? (
        <div className="absolute right-0 top-11 z-40 w-44 rounded-xl border border-border bg-card p-1 shadow-card">
          {languages.map((item) => (
            <button
              key={item.code}
              type="button"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-card-hover"
              onClick={() => void choose(item.code)}
            >
              <span className="w-4">{language === item.code ? <Check className="h-4 w-4 text-primary" /> : null}</span>
              {item.native}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
