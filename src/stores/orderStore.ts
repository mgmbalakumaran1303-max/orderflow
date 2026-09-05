import { create } from "zustand";
import { orderRepository, type OrderFilters } from "@/services/api/orderRepository";
import type { Order, OrderStatus } from "@/types";

interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  selectedNumber: number | null;
  load: (restaurantId: string) => Promise<void>;
  getByNumber: (number: number) => Order | undefined;
  transition: (number: number, status: OrderStatus, rejectReason?: string) => Promise<Order>;
  counts: (restaurantId: string) => Record<OrderStatus | "all", number>;
  kpis: (restaurantId: string) => { new: number; preparing: number; ready: number; completed: number };
  setSelected: (number: number | null) => void;
  filterLocal: (filters: OrderFilters) => Order[];
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  loading: false,
  error: null,
  selectedNumber: null,
  load: async (restaurantId) => {
    set({ loading: true, error: null });
    try {
      const orders = await orderRepository.list({ restaurantId });
      set({ orders, loading: false });
    } catch {
      set({ loading: false, error: "Unable to load orders." });
    }
  },
  getByNumber: (number) => get().orders.find((order) => order.number === number),
  transition: async (number, status, rejectReason) => {
    const updated = await orderRepository.transition(number, status, rejectReason);
    set({
      orders: get().orders.map((order) => (order.number === number ? updated : order)),
    });
    return updated;
  },
  counts: (restaurantId) => {
    const list = get().orders.filter((order) => order.restaurantId === restaurantId);
    return {
      all: list.length,
      new: list.filter((order) => order.status === "new").length,
      preparing: list.filter((order) => order.status === "preparing").length,
      ready: list.filter((order) => order.status === "ready").length,
      completed: list.filter((order) => order.status === "completed").length,
      cancelled: list.filter((order) => order.status === "cancelled").length,
    };
  },
  kpis: (restaurantId) => {
    const list = get().orders.filter((order) => order.restaurantId === restaurantId);
    return {
      new: list.filter((order) => order.status === "new").length,
      preparing: list.filter((order) => order.status === "preparing").length,
      ready: list.filter((order) => order.status === "ready").length,
      completed: list.filter((order) => order.status === "completed").length,
    };
  },
  setSelected: (number) => set({ selectedNumber: number }),
  filterLocal: (filters) => {
    return get().orders.filter((order) => {
      if (filters.restaurantId && order.restaurantId !== filters.restaurantId) return false;
      if (filters.status && filters.status !== "all" && order.status !== filters.status) return false;
      if (filters.source && filters.source !== "all" && order.source !== filters.source) return false;
      if (filters.customer && !order.customer.name.toLowerCase().includes(filters.customer.toLowerCase())) return false;
      if (typeof filters.minAmount === "number" && order.total < filters.minAmount) return false;
      if (typeof filters.maxAmount === "number" && order.total > filters.maxAmount) return false;
      if (filters.query) {
        const q = filters.query.toLowerCase();
        const hay = `#${order.number} ${order.customer.name} ${order.customer.phone} ${order.source} ${order.status}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  },
}));
