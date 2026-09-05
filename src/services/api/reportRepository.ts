import { db } from "@/data/db";
import { sleep } from "@/utils/format";
import type { Order, OrderSource } from "@/types";

export interface ReportSummary {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  cancelledOrders: number;
  trend: Array<{ date: string; orders: number; revenue: number; cancelled: number }>;
  bySource: Array<{ source: OrderSource; count: number; percent: number }>;
}

function inRange(order: Order, from: Date, to: Date): boolean {
  const created = new Date(order.createdAt);
  return created >= from && created <= to;
}

export const reportRepository = {
  async summarize(restaurantId: string, from: Date, to: Date): Promise<ReportSummary> {
    await sleep(240);
    const orders = db.orders.filter((order) => order.restaurantId === restaurantId && inRange(order, from, to));
    const totalOrders = orders.length;
    const cancelledOrders = orders.filter((order) => order.status === "cancelled").length;
    const revenueOrders = orders.filter((order) => order.status !== "cancelled");
    const totalRevenue = revenueOrders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = revenueOrders.length ? totalRevenue / revenueOrders.length : 0;
    const days = Math.max(1, Math.ceil((+to - +from) / 86_400_000));
    const trend = Array.from({ length: Math.min(days, 14) }, (_, index) => {
      const date = new Date(from);
      date.setDate(from.getDate() + index);
      const key = date.toISOString().slice(0, 10);
      const dayOrders = orders.filter((order) => order.createdAt.slice(0, 10) === key);
      return {
        date: key.slice(5),
        orders: dayOrders.length,
        revenue: dayOrders.filter((order) => order.status !== "cancelled").reduce((sum, order) => sum + order.total, 0),
        cancelled: dayOrders.filter((order) => order.status === "cancelled").length,
      };
    });
    const sources: OrderSource[] = ["uber-eats", "wolt", "whatsapp", "website", "other"];
    const bySource = sources.map((source) => {
      const count = orders.filter((order) => order.source === source).length;
      return { source, count, percent: totalOrders ? Math.round((count / totalOrders) * 100) : 0 };
    });
    return { totalOrders, totalRevenue, averageOrderValue, cancelledOrders, trend, bySource };
  },
};
