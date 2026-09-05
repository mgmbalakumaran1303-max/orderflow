import { db } from "@/data/db";
import { sleep } from "@/utils/format";
import { ApiError } from "@/services/api/apiClient";
import type { AuthUser, Restaurant } from "@/types";

const CREDENTIALS = {
  email: "admin@restaurant.com",
  password: "password123",
};

export const authRepository = {
  async login(email: string, password: string): Promise<AuthUser> {
    await sleep(700);
    if (email.toLowerCase() === "offline@restaurant.com") {
      throw new ApiError("Unable to reach the server. Check your connection and try again.", 503);
    }
    if (email.toLowerCase() !== CREDENTIALS.email || password !== CREDENTIALS.password) {
      throw new ApiError("Invalid email or password.", 401);
    }
    return {
      name: "Restaurant Admin",
      email: CREDENTIALS.email,
      role: "Restaurant Admin",
    };
  },
};

export const restaurantRepository = {
  async list(): Promise<Restaurant[]> {
    await sleep(120);
    return structuredClone(db.restaurants);
  },
  async get(id: string): Promise<Restaurant | null> {
    await sleep(120);
    const found = db.restaurants.find((restaurant) => restaurant.id === id);
    return found ? structuredClone(found) : null;
  },
  async save(restaurant: Restaurant): Promise<Restaurant> {
    await sleep(200);
    const index = db.restaurants.findIndex((row) => row.id === restaurant.id);
    if (index >= 0) db.restaurants[index] = restaurant;
    return structuredClone(restaurant);
  },
};
