import { create } from "zustand";
import { authRepository } from "@/services/api/authRepository";
import { ApiError } from "@/services/api/apiClient";
import { STORAGE_KEYS, readJson, removeKey, writeJson } from "@/utils/storage";
import type { AuthUser } from "@/types";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  hydrate: () => {
    const persisted = readJson<{ user: AuthUser; token: string } | null>(STORAGE_KEYS.auth, null);
    if (persisted?.user && persisted.token) {
      set({ user: persisted.user, token: persisted.token });
    }
  },
  login: async (email, password) => {
    try {
      const user = await authRepository.login(email, password);
      const token = "mock-session-token";
      writeJson(STORAGE_KEYS.auth, { user, token });
      set({ user, token });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError("Unable to reach the server. Check your connection and try again.", 503);
    }
  },
  logout: () => {
    removeKey(STORAGE_KEYS.auth);
    set({ user: null, token: null });
  },
}));

useAuthStore.getState().hydrate();
