import { db } from "@/data/db";
import { sleep } from "@/utils/format";
import type { AppNotification, Device, MenuItem, Order, StaffUser } from "@/types";

export interface SearchResults {
  orders: Order[];
  customers: Array<{ name: string; phone: string; orderNumber: number }>;
  menu: MenuItem[];
  users: StaffUser[];
  devices: Device[];
}

export const searchRepository = {
  async search(query: string): Promise<SearchResults> {
    await sleep(120);
    const q = query.trim().toLowerCase();
    if (!q) {
      return { orders: [], customers: [], menu: [], users: [], devices: [] };
    }
    const orders = db.orders.filter((order) => `#${order.number}`.includes(q) || String(order.number).includes(q)).slice(0, 5);
    const customers = db.orders
      .filter((order) => order.customer.name.toLowerCase().includes(q) || order.customer.phone.includes(q))
      .slice(0, 5)
      .map((order) => ({ name: order.customer.name, phone: order.customer.phone, orderNumber: order.number }));
    const menu = db.menuItems.filter((item) => item.name.toLowerCase().includes(q)).slice(0, 5);
    const users = db.users.filter((user) => user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q)).slice(0, 5);
    const devices = db.devices.filter((device) => device.name.toLowerCase().includes(q) || device.deviceId.toLowerCase().includes(q)).slice(0, 5);
    return { orders, customers, menu, users, devices };
  },
};

export const notificationRepository = {
  async list(): Promise<AppNotification[]> {
    await sleep(80);
    return structuredClone(db.notifications);
  },
  async markRead(id: string): Promise<void> {
    const found = db.notifications.find((item) => item.id === id);
    if (found) found.read = true;
  },
};
