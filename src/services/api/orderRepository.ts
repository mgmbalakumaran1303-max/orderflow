import { db } from "@/data/db";
import { sleep } from "@/utils/format";
import { assertTransition } from "@/utils/orderMachine";
import type { Order, OrderSource, OrderStatus } from "@/types";

export interface OrderFilters {
  restaurantId?: string;
  status?: OrderStatus | "all";
  source?: OrderSource | "all";
  query?: string;
  from?: string;
  to?: string;
  minAmount?: number;
  maxAmount?: number;
  customer?: string;
}

function matches(order: Order, filters: OrderFilters): boolean {
  if (filters.restaurantId && order.restaurantId !== filters.restaurantId) return false;
  if (filters.status && filters.status !== "all" && order.status !== filters.status) return false;
  if (filters.source && filters.source !== "all" && order.source !== filters.source) return false;
  if (filters.customer && !order.customer.name.toLowerCase().includes(filters.customer.toLowerCase())) {
    return false;
  }
  if (typeof filters.minAmount === "number" && order.total < filters.minAmount) return false;
  if (typeof filters.maxAmount === "number" && order.total > filters.maxAmount) return false;
  if (filters.from && new Date(order.createdAt) < new Date(filters.from)) return false;
  if (filters.to && new Date(order.createdAt) > new Date(filters.to)) return false;
  if (filters.query) {
    const q = filters.query.toLowerCase();
    const hay = [
      `#${order.number}`,
      String(order.number),
      order.customer.name,
      order.customer.phone,
      order.source,
      order.status,
    ]
      .join(" ")
      .toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

function stampTimeline(order: Order, status: OrderStatus): Order["timeline"] {
  const now = new Date().toISOString();
  const next = order.timeline.map((event) => {
    if (event.status === status && !event.at) return { ...event, at: now };
    if (status === "preparing" && event.status === "accepted" && !event.at) {
      return { ...event, at: now };
    }
    return event;
  });
  if (status === "cancelled" && !next.some((event) => event.status === "cancelled")) {
    next.push({ status: "cancelled", label: "Cancelled", at: now });
  }
  return next;
}

export const orderRepository = {
  async list(filters: OrderFilters = {}): Promise<Order[]> {
    await sleep(220);
    return db.orders
      .filter((order) => matches(order, filters))
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .map((order) => structuredClone(order));
  },

  async getByNumber(number: number): Promise<Order | null> {
    await sleep(160);
    const found = db.orders.find((order) => order.number === number);
    return found ? structuredClone(found) : null;
  },

  async transition(number: number, status: OrderStatus, rejectReason?: string): Promise<Order> {
    await sleep(200);
    const order = db.orders.find((item) => item.number === number);
    if (!order) throw new Error("Order not found");
    assertTransition(order.status, status);
    order.status = status;
    order.rejectReason = rejectReason;
    order.timeline = stampTimeline(order, status);
    return structuredClone(order);
  },
};
