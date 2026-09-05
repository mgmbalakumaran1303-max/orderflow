import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CheckCircle2, Clock3, Flame, ShoppingBag } from "lucide-react";
import { format } from "date-fns";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SourceIcon } from "@/components/ui/SourceIcon";
import { CardSkeleton, ChartSkeleton, TableSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/Tabs";
import { useOrderStore } from "@/stores/orderStore";
import { useRestaurantStore } from "@/stores/restaurantStore";
import { formatEuro, formatRelative, itemCountLabel, sourceLabel } from "@/utils/format";
import { Button } from "@/components/ui/Button";

const COLORS = ["#f97316", "#3b82f6", "#22c55e", "#eab308", "#8ba0b3"];

export function DashboardPage() {
  const navigate = useNavigate();
  const selectedId = useRestaurantStore((s) => s.selectedId);
  const orders = useOrderStore((s) => s.orders);
  const loading = useOrderStore((s) => s.loading);
  const error = useOrderStore((s) => s.error);
  const load = useOrderStore((s) => s.load);
  const kpis = useMemo(() => {
    const list = orders.filter((order) => order.restaurantId === selectedId);
    return {
      new: list.filter((order) => order.status === "new").length,
      preparing: list.filter((order) => order.status === "preparing").length,
      ready: list.filter((order) => order.status === "ready").length,
      completed: list.filter((order) => order.status === "completed").length,
    };
  }, [orders, selectedId]);
  const [date, setDate] = useState(() => new Date());

  const overview = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(date);
      d.setDate(date.getDate() - (6 - i));
      const key = d.toISOString().slice(0, 10);
      const day = orders.filter((o) => o.restaurantId === selectedId && o.createdAt.slice(0, 10) === key);
      return {
        date: format(d, "MMM d"),
        New: day.filter((o) => o.status === "new").length,
        Preparing: day.filter((o) => o.status === "preparing").length,
        Completed: day.filter((o) => o.status === "completed").length,
      };
    });
  }, [orders, selectedId, date]);

  const bySource = useMemo(() => {
    const list = orders.filter((o) => o.restaurantId === selectedId);
    const groups = ["uber-eats", "wolt", "whatsapp", "website", "other"] as const;
    return groups.map((source) => ({
      name: sourceLabel(source),
      value: list.filter((o) => o.source === source).length,
    }));
  }, [orders, selectedId]);

  const recent = orders.filter((o) => o.restaurantId === selectedId).slice(0, 6);
  const total = bySource.reduce((sum, row) => sum + row.value, 0);

  if (loading && !orders.length) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <ChartSkeleton />
        <TableSkeleton />
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Unable to load dashboard" description={error} onRetry={() => void load(selectedId)} />;
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Welcome back, Restaurant Admin 👋"
        actions={
          <label className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
            <span className="text-muted">Today,</span>
            <input
              type="date"
              className="bg-transparent text-foreground outline-none"
              value={format(date, "yyyy-MM-dd")}
              onChange={(e) => setDate(new Date(e.target.value))}
            />
          </label>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="New Orders" value={kpis.new} trend="+20% vs yesterday" tone="primary" icon={<ShoppingBag className="h-4 w-4" />} />
        <StatCard label="Preparing" value={kpis.preparing} trend="+12% vs yesterday" tone="warning" icon={<Flame className="h-4 w-4" />} />
        <StatCard label="Ready" value={kpis.ready} trend="-5% vs yesterday" tone="success" icon={<Clock3 className="h-4 w-4" />} />
        <StatCard label="Completed" value={kpis.completed} trend="+18% vs yesterday" tone="info" icon={<CheckCircle2 className="h-4 w-4" />} />
      </div>
      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <h2 className="mb-4 text-sm font-semibold">Orders Overview</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={overview}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="var(--muted)" fontSize={12} />
                <YAxis stroke="var(--muted)" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="New" stroke="#f97316" fill="#f97316" fillOpacity={0.15} />
                <Area type="monotone" dataKey="Preparing" stroke="#eab308" fill="#eab308" fillOpacity={0.12} />
                <Area type="monotone" dataKey="Completed" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.12} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h2 className="mb-4 text-sm font-semibold">Orders by Source</h2>
          <div className="relative h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={bySource} innerRadius={52} outerRadius={74} paddingAngle={3} dataKey="value">
                  {bySource.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-xs text-muted">Total</p>
              <p className="text-xl font-semibold">{total}</p>
            </div>
          </div>
          <div className="mt-2 space-y-1">
            {bySource.map((row, index) => (
              <div key={row.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-muted">
                  <span className="h-2 w-2 rounded-full" style={{ background: COLORS[index] }} />
                  {row.name}
                </span>
                <span>{total ? Math.round((row.value / total) * 100) : 0}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card className="mt-5" padding={false}>
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-sm font-semibold">Recent Orders</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate("/orders")}>
            View all orders
          </Button>
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted">
              <tr className="border-y border-border">
                {["Order", "Source", "Customer", "Items", "Total", "Status", "Time"].map((h) => (
                  <th key={h} className="px-4 py-2 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((order) => (
                <tr
                  key={order.id}
                  className="cursor-pointer border-b border-border/70 hover:bg-card-hover"
                  onClick={() => navigate(`/orders?orderId=${order.number}`)}
                >
                  <td className="px-4 py-3 font-medium">#{order.number}</td>
                  <td className="px-4 py-3"><SourceIcon source={order.source} /></td>
                  <td className="px-4 py-3">{order.customer.name}</td>
                  <td className="px-4 py-3">{itemCountLabel(order.items.length)}</td>
                  <td className="px-4 py-3">{formatEuro(order.total)}</td>
                  <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                  <td className="px-4 py-3 text-muted">{formatRelative(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-2 p-3 md:hidden">
          {recent.map((order) => (
            <button
              key={order.id}
              type="button"
              className="w-full rounded-lg border border-border bg-surface-2 p-3 text-left"
              onClick={() => navigate(`/orders?orderId=${order.number}`)}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">#{order.number}</span>
                <StatusBadge status={order.status} />
              </div>
              <p className="mt-1 text-sm text-muted">{order.customer.name} · {formatEuro(order.total)}</p>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
