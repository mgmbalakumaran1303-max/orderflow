import { create } from "zustand";
import { STORAGE_KEYS, readJson, writeJson } from "@/utils/storage";

export type ToastTone = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
  /** Auto-dismiss delay in ms. Defaults applied by ToastViewport when omitted. */
  duration?: number;
}

export interface ConfirmOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "primary" | "danger" | "success";
  extra?: string;
  onConfirm: () => void | Promise<void>;
}

interface UiState {
  sidebarOpen: boolean;
  /** Desktop-only icon-rail collapse state, independent of the mobile overlay. */
  sidebarCollapsed: boolean;
  toasts: ToastItem[];
  confirm: ConfirmOptions | null;
  helpOpen: boolean;
  unsavedPrompt: { onStay: () => void; onDiscard: () => void } | null;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  toggleSidebarCollapsed: () => void;
  toast: (tone: ToastTone, title: string, description?: string, duration?: number) => void;
  dismissToast: (id: string) => void;
  openConfirm: (options: ConfirmOptions) => void;
  closeConfirm: () => void;
  setHelpOpen: (open: boolean) => void;
  askUnsaved: (handlers: { onStay: () => void; onDiscard: () => void }) => void;
  closeUnsaved: () => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  sidebarOpen: false,
  sidebarCollapsed: readJson<boolean>(STORAGE_KEYS.sidebarCollapsed, false),
  toasts: [],
  confirm: null,
  helpOpen: false,
  unsavedPrompt: null,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
  toggleSidebarCollapsed: () => {
    const next = !get().sidebarCollapsed;
    writeJson(STORAGE_KEYS.sidebarCollapsed, next);
    set({ sidebarCollapsed: next });
  },
  toast: (tone, title, description, duration) => {
    const id = crypto.randomUUID();
    // Auto-dismiss timing (incl. pause-on-hover) is owned by ToastViewport,
    // not the store, so the timer can be paused while a user is reading it.
    set({ toasts: [...get().toasts, { id, tone, title, description, duration }] });
  },
  dismissToast: (id) => set({ toasts: get().toasts.filter((item) => item.id !== id) }),
  openConfirm: (options) => set({ confirm: options }),
  closeConfirm: () => set({ confirm: null }),
  setHelpOpen: (open) => set({ helpOpen: open }),
  askUnsaved: (handlers) => set({ unsavedPrompt: handlers }),
  closeUnsaved: () => set({ unsavedPrompt: null }),
}));
