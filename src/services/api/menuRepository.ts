import { db } from "@/data/db";
import { sleep } from "@/utils/format";
import type { MenuCategory, MenuItem } from "@/types";

export const menuRepository = {
  async categories(): Promise<MenuCategory[]> {
    await sleep(160);
    return structuredClone(db.menuCategories);
  },
  async items(): Promise<MenuItem[]> {
    await sleep(180);
    return structuredClone(db.menuItems);
  },
  async saveItem(item: MenuItem): Promise<MenuItem> {
    await sleep(200);
    const index = db.menuItems.findIndex((row) => row.id === item.id);
    if (index === -1) {
      db.menuItems.push(item);
    } else {
      db.menuItems[index] = item;
    }
    return structuredClone(item);
  },
  async createItem(item: Omit<MenuItem, "id">): Promise<MenuItem> {
    await sleep(220);
    const created: MenuItem = { ...item, id: `mi-${Date.now()}` };
    db.menuItems.push(created);
    return structuredClone(created);
  },
  async deleteItem(id: string): Promise<void> {
    await sleep(180);
    db.menuItems = db.menuItems.filter((item) => item.id !== id);
  },
  async createCategory(name: string): Promise<MenuCategory> {
    await sleep(160);
    const created = { id: `cat-${Date.now()}`, name };
    db.menuCategories.push(created);
    return created;
  },
  async deleteCategory(id: string): Promise<void> {
    await sleep(180);
    db.menuCategories = db.menuCategories.filter((category) => category.id !== id);
    db.menuItems = db.menuItems.filter((item) => item.categoryId !== id);
  },
};
