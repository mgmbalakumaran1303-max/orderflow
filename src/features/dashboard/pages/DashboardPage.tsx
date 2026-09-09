import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, CheckCircle2, Flame, ShoppingBag, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SourceIcon } from "@/components/ui/SourceIcon";
import { WaitingBadge } from "@/components/ui/WaitingBadge";
import { CardSkeleton, ChartSkeleton, TableSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/Tabs";
import { useOrderStore } from "@/stores/orderStore";
import { useRestaurantStore } from "@/stores/restaurantStore";
import { cn, formatEuro, formatShortDate, itemCountLabel } from "@/utils/format";
import { CHANNEL_TONE, ORDER_CHANNELS, sourceLabelKey } from "@/constants/channels";
import { useTranslation } from "react-i18next";

type Range = "today" | "7d" | "30d";

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const selectedId = useRestaurantStore((s) => s.selectedId);
  const orders = useOrderStore((s) => s.orders);
  const loading = useOrderStore((s) => s.loading);
  const error = useOrderStore((s) => s.error);
  const load = useOrderStore((s) => s.load);
  const [range, setRange] = useState<Range>("7d");

  const restaurantOrders = useMemo(() => orders.filter((order) => order.restaurantId === selectedId), [orders, selectedId]);

  const kpis = useMemo(() => {
    const today = restaurantOrders.filter((order) => isSameDay(new Date(order.createdAt), new Date()));
    return {
      new: restaurantOrders.filter((order) => order.status === "new").length,
      preparing: restaurantOrders.filter((order) => order.status === "preparing").length,
      ready: restaurantOrders.filter((order) => order.status === "ready").length,
      issues: restaurantOrders.filter((order) => order.issues.length > 0 && order.status !== "completed" && order.status !== "cancelled").length,
      ordersToday: today.length,
      revenueToday: today.filter((order) => order.status !== "cancelled").reduce((sum, order) => sum + order.total, 0),
    };
  }, [restaurantOrders]);

  const overview = useMemo(() => {
    if (range === "today") {
      const now = new Date();
      return Array.from({ length: 6 }, (_, i) => {
        const startHour = i * 4;
        const endHour = startHour + 4;
        const bucket = restaurantOrders.filter((order) => {
          const created = new Date(order.createdAt);
          return isSameDay(created, now) && created.getHours() >= startHour && created.getHours() < endHour;
        });
        return {
          date: `${String(startHour).padStart(2, "0")}:00`,
          New: bucket.filter((o) => o.status === "new").length,
          Preparing: bucket.filter((o) => o.status === "preparing").length,
          Completed: bucket.filter((o) => o.status === "completed").length,
        };
      });
    }
    const days = range === "7d" ? 7 : 30;
    return Array.from({ length: days }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const day = restaurantOrders.filter((o) => isSameDay(new Date(o.createdAt), d));
      return {
        date: formatShortDate(d),
        New: day.filter((o) => o.status === "new").length,
        Preparing: day.filter((o) => o.status === "preparing").length,
        Completed: day.filter((o) => o.status === "completed").length,
      };
    });
  }, [restaurantOrders, range]);

  const hasChartData = overview.some((row) => row.New + row.Preparing + row.Completed > 0);

  const bySource = useMemo(() => {
    return ORDER_CHANNELS.map((source) => ({
      source,
      name: t(sourceLabelKey(source)),
      value: restaurantOrders.filter((o) => o.source === source).length,
    }));
  }, [restaurantOrders, t]);

  const liveOrders = useMemo(
    () =>
      restaurantOrders
        .filter((order) => order.status === "new" || order.status === "preparing" || order.status === "ready")
        .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))
        .slice(0, 8),
    [restaurantOrders],
  );

  const total = bySource.reduce((sum, row) => sum + row.value, 0);
  const seriesLabels: Record<string, string> = {
    New: t("dashboard.seriesNew"),
    Preparing: t("dashboard.seriesPreparing"),
    Completed: t("dashboard.seriesCompleted"),
  };

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
    return <ErrorState title={t("dashboard.unableToLoad")} description={error} onRetry={() => void load(selectedId)} />;
  }

  return (
    <div>
      <PageHeader title={t("dashboard.title")} description={t("dashboard.welcome")} />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label={t("dashboard.newOrders")} value={kpis.new} tone="primary" icon={<ShoppingBag className="h-4 w-4" />} onClick={() => navigate("/new")} />
        <StatCard label={t("dashboard.preparing")} value={kpis.preparing} tone="warning" icon={<Flame className="h-4 w-4" />} onClick={() => navigate("/preparing")} />
        <StatCard label={t("dashboard.ready")} value={kpis.ready} tone="success" icon={<CheckCircle2 className="h-4 w-4" />} onClick={() => navigate("/ready")} />
        <StatCard label={t("dashboard.issues")} value={kpis.issues} tone="danger" icon={<AlertTriangle className="h-4 w-4" />} onClick={() => navigate("/orders?issue=1")} />
        <StatCard label={t("dashboard.ordersToday")} value={kpis.ordersToday} tone="info" icon={<ShoppingBag className="h-4 w-4" />} onClick={() => navigate("/orders?today=1")} />
        <StatCard label={t("dashboard.revenueToday")} value={formatEuro(kpis.revenueToday)} tone="success" icon={<TrendingUp className="h-4 w-4" />} onClick={() => navigate("/reports")} />
      </div>

      <Card className="mt-5" padding={false}>
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-sm font-semibold">{t("dashboard.liveOrders")}</h2>
          <button type="button" className="text-sm text-primary hover:underline" onClick={() => navigate("/orders")}>
            {t("dashboard.viewAll")}
          </button>
        </div>
        {liveOrders.length === 0 ? (
          <p className="px-4 pb-4 text-sm text-muted">{t("orders.noOrders")}</p>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted">
                  <tr className="border-y border-border">
                    {[t("orders.order"), t("orders.source"), t("orders.customer"), t("orders.items"), t("orders.total"), t("orders.status"), t("orders.waitingTime")].map((h) => (
                      <th key={h} className="px-4 py-2 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {liveOrders.map((order) => (
                    <tr key={order.id} className="cursor-pointer border-b border-border/70 hover:bg-card-hover" onClick={() => navigate(`/orders?orderId=${order.number}`)}>
                      <td className="px-4 py-3 font-medium">#{order.number}</td>
                      <td className="px-4 py-3"><SourceIcon source={order.source} /></td>
                      <td className="px-4 py-3">{order.customer.name}</td>
                      <td className="px-4 py-3">{itemCountLabel(order.items.length)}</td>
                      <td className="px-4 py-3">{formatEuro(order.total)}</td>
                      <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                      <td className="px-4 py-3"><WaitingBadge createdAt={order.createdAt} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-2 p-3 md:hidden">
              {liveOrders.map((order) => (
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
                  <div className="mt-1"><WaitingBadge createdAt={order.createdAt} /></div>
                </button>
              ))}
            </div>
          </>
        )}
      </Card>

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">{t("dashboard.ordersOverview")}</h2>
            <div className="flex gap-1 rounded-lg border border-border bg-surface-2 p-1">
              {(["today", "7d", "30d"] as Range[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs transition",
                    range === r ? "bg-primary text-white" : "text-muted hover:text-foreground",
                  )}
                >
                  {r === "today" ? t("dashboard.rangeToday") : r === "7d" ? t("dashboard.range7Days") : t("dashboard.range30Days")}
                </button>
              ))}
            </div>
          </div>
          <div className="h-56">
            {hasChartData ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={overview}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="var(--muted)" fontSize={11} interval={range === "30d" ? 3 : 0} />
                  <YAxis stroke="var(--muted)" fontSize={12} allowDecimals={false} width={28} />
                  <Tooltip
                    contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }}
                    formatter={(value, name) => [value, seriesLabels[String(name)] ?? String(name)]}
                  />
                  <Legend formatter={(name: string) => seriesLabels[name] ?? name} wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="New" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.15} />
                  <Area type="monotone" dataKey="Preparing" stroke="var(--warning)" fill="var(--warning)" fillOpacity={0.12} />
                  <Area type="monotone" dataKey="Completed" stroke="var(--success)" fill="var(--success)" fillOpacity={0.12} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted">{t("dashboard.noChartData")}</div>
            )}
          </div>
        </Card>
        <Card>
          <h2 className="mb-4 text-sm font-semibold">{t("dashboard.ordersBySource")}</h2>
          {total === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted">{t("dashboard.noChartData")}</div>
          ) : (
            <>
              <div className="relative h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={bySource} innerRadius={48} outerRadius={68} paddingAngle={3} dataKey="value">
                      {bySource.map((entry) => (
                        <Cell key={entry.source} fill={`var(--${CHANNEL_TONE[entry.source]})`} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-xs text-muted">{t("orders.total")}</p>
                  <p className="text-xl font-semibold">{total}</p>
                </div>
              </div>
              <div className="mt-2 space-y-1.5">
                {bySource.map((row) => (
                  <div key={row.source} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-muted">
                      <span className="h-2 w-2 rounded-full" style={{ background: `var(--${CHANNEL_TONE[row.source]})` }} />
                      {row.name}
                    </span>
                    <span className="font-medium text-foreground">
                      {row.value} · {total ? Math.round((row.value / total) * 100) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
