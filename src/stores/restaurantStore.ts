import { create } from "zustand";
import { restaurantRepository } from "@/services/api/authRepository";
import { STORAGE_KEYS, readJson, writeJson } from "@/utils/storage";
import type { Restaurant } from "@/types";

interface RestaurantState {
  restaurants: Restaurant[];
  selectedId: string;
  selected: Restaurant | null;
  load: () => Promise<void>;
  select: (id: string) => void;
  updateCurrent: (patch: Partial<Restaurant>) => Promise<void>;
}

export const useRestaurantStore = create<RestaurantState>((set, get) => ({
  restaurants: [],
  selectedId: readJson(STORAGE_KEYS.restaurant, "rest-1"),
  selected: null,
  load: async () => {
    const restaurants = await restaurantRepository.list();
    const selectedId = get().selectedId || restaurants[0]?.id;
    const selected = restaurants.find((item) => item.id === selectedId) ?? restaurants[0] ?? null;
    set({ restaurants, selectedId: selected?.id ?? "", selected });
  },
  select: (id) => {
    const selected = get().restaurants.find((item) => item.id === id) ?? null;
    writeJson(STORAGE_KEYS.restaurant, id);
    set({ selectedId: id, selected });
  },
  updateCurrent: async (patch) => {
    const current = get().selected;
    if (!current) return;
    const next = { ...current, ...patch };
    await restaurantRepository.save(next);
    set({
      selected: next,
      restaurants: get().restaurants.map((item) => (item.id === next.id ? next : item)),
    });
  },
}));
