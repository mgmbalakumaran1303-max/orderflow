import { create } from "zustand";

export type ToastTone = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
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
  toasts: ToastItem[];
  confirm: ConfirmOptions | null;
  helpOpen: boolean;
  unsavedPrompt: { onStay: () => void; onDiscard: () => void } | null;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  toast: (tone: ToastTone, title: string, description?: string) => void;
  dismissToast: (id: string) => void;
  openConfirm: (options: ConfirmOptions) => void;
  closeConfirm: () => void;
  setHelpOpen: (open: boolean) => void;
  askUnsaved: (handlers: { onStay: () => void; onDiscard: () => void }) => void;
  closeUnsaved: () => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  sidebarOpen: false,
  toasts: [],
  confirm: null,
  helpOpen: false,
  unsavedPrompt: null,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
  toast: (tone, title, description) => {
    const id = crypto.randomUUID();
    set({ toasts: [...get().toasts, { id, tone, title, description }] });
    window.setTimeout(() => {
      get().dismissToast(id);
    }, 3600);
  },
  dismissToast: (id) => set({ toasts: get().toasts.filter((item) => item.id !== id) }),
  openConfirm: (options) => set({ confirm: options }),
  closeConfirm: () => set({ confirm: null }),
  setHelpOpen: (open) => set({ helpOpen: open }),
  askUnsaved: (handlers) => set({ unsavedPrompt: handlers }),
  closeUnsaved: () => set({ unsavedPrompt: null }),
}));
