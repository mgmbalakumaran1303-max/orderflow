import { create } from "zustand";
import type { AppSettings, ThemeMode } from "@/types";
import { STORAGE_KEYS, readJson, writeJson } from "@/utils/storage";

const defaults: AppSettings = {
  theme: "dark",
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

interface SettingsState extends AppSettings {
  dirty: boolean;
  setTheme: (theme: ThemeMode) => void;
  patch: (value: Partial<AppSettings>) => void;
  save: () => void;
  reset: () => void;
  applyTheme: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => {
  const persisted = readJson<AppSettings>(STORAGE_KEYS.settings, defaults);
  return {
    ...defaults,
    ...persisted,
    dirty: false,
    applyTheme: () => {
      document.documentElement.dataset.theme = get().theme;
    },
    setTheme: (theme) => {
      document.documentElement.dataset.theme = theme;
      const next = { ...get(), theme, dirty: true };
      set({ theme, dirty: true });
      writeJson(STORAGE_KEYS.settings, {
        theme: next.theme,
        notifications: next.notifications,
        orders: next.orders,
        printer: next.printer,
      });
    },
    patch: (value) => set({ ...value, dirty: true }),
    save: () => {
      const { theme, notifications, orders, printer } = get();
      writeJson(STORAGE_KEYS.settings, { theme, notifications, orders, printer });
      set({ dirty: false });
    },
    reset: () => {
      writeJson(STORAGE_KEYS.settings, defaults);
      document.documentElement.dataset.theme = defaults.theme;
      set({ ...defaults, dirty: false });
    },
  };
});

if (typeof document !== "undefined") {
  document.documentElement.dataset.theme = useSettingsStore.getState().theme;
}
