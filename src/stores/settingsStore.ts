import { create } from "zustand";
import type { AppLanguage, AppSettings, ThemeMode } from "@/types";
import { STORAGE_KEYS, readJson, writeJson } from "@/utils/storage";
import i18n, { persistLanguage, readSavedLanguage } from "@/i18n";

const THEME_KEY = "orderflow_theme";

function readTheme(): ThemeMode {
  const standalone = localStorage.getItem(THEME_KEY);
  if (standalone === "light" || standalone === "dark") return standalone;
  const nested = readJson<Partial<AppSettings>>(STORAGE_KEYS.settings, {});
  if (nested.theme === "light" || nested.theme === "dark") return nested.theme;
  return "light";
}

const defaults: AppSettings = {
  theme: "light",
  language: "en",
  notifications: {
    newOrder: true,
    sound: true,
    desktop: false,
    status: true,
    lowCapacity: true,
  },
  orders: {
    autoAccept: false,
    autoPrint: true,
    prepTimeMinutes: 15,
    timeoutMinutes: 20,
    allowCancellation: true,
  },
  printer: {
    name: "Kitchen-Epson-01",
    connectionType: "USB",
    autoPrint: true,
    receiptFormat: "80mm",
    available: true,
  },
};

function persistAll(settings: AppSettings): void {
  writeJson(STORAGE_KEYS.settings, settings);
  localStorage.setItem(THEME_KEY, settings.theme);
  persistLanguage(settings.language);
}

interface SettingsState extends AppSettings {
  dirty: boolean;
  setTheme: (theme: ThemeMode) => void;
  setLanguage: (language: AppLanguage) => Promise<void>;
  patch: (value: Partial<AppSettings>) => void;
  save: () => void;
  reset: () => void;
  applyTheme: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => {
  const persisted = readJson<Partial<AppSettings>>(STORAGE_KEYS.settings, {});
  const theme = readTheme();
  const language = persisted.language ?? readSavedLanguage();
  const initial: AppSettings = { ...defaults, ...persisted, theme, language };
  return {
    ...initial,
    dirty: false,
    applyTheme: () => {
      document.documentElement.dataset.theme = get().theme;
      document.documentElement.lang = get().language;
    },
    setTheme: (theme) => {
      document.documentElement.dataset.theme = theme;
      const next = { ...get(), theme };
      persistAll({
        theme,
        language: next.language,
        notifications: next.notifications,
        orders: next.orders,
        printer: next.printer,
      });
      set({ theme, dirty: false });
    },
    setLanguage: async (language) => {
      await i18n.changeLanguage(language);
      document.documentElement.lang = language;
      const next = { ...get(), language };
      persistAll({
        theme: next.theme,
        language,
        notifications: next.notifications,
        orders: next.orders,
        printer: next.printer,
      });
      set({ language, dirty: false });
    },
    patch: (value) => set({ ...value, dirty: true }),
    save: () => {
      const { theme, language, notifications, orders, printer } = get();
      persistAll({ theme, language, notifications, orders, printer });
      set({ dirty: false });
    },
    reset: () => {
      persistAll(defaults);
      document.documentElement.dataset.theme = defaults.theme;
      document.documentElement.lang = defaults.language;
      void i18n.changeLanguage(defaults.language);
      set({ ...defaults, dirty: false });
    },
  };
});

if (typeof document !== "undefined") {
  const state = useSettingsStore.getState();
  document.documentElement.dataset.theme = state.theme;
  document.documentElement.lang = state.language;
}
