import { useEffect, useMemo, useState } from "react";
import { Download, Filter, Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { Tabs, EmptyState, ErrorState } from "@/components/ui/Tabs";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SourceIcon } from "@/components/ui/SourceIcon";
import { WaitingBadge } from "@/components/ui/WaitingBadge";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { Modal } from "@/components/modals/Modal";
import { FormField, Select, TextInput } from "@/components/ui/FormField";
import { OrderDetailsDrawer } from "@/features/orders/drawers/OrderDetailsDrawer";
import { useOrderStore } from "@/stores/orderStore";
import { useRestaurantStore } from "@/stores/restaurantStore";
import { useUiStore } from "@/stores/uiStore";
import { STORAGE_KEYS, readJson, writeJson } from "@/utils/storage";
import { formatEuro, itemCountLabel, sleep } from "@/utils/format";
import { ORDER_CHANNELS, sourceLabelKey } from "@/constants/channels";
import type { ExportFormat, FulfilmentType, OrderSource, OrderStatus } from "@/types";
import { useTranslation } from "react-i18next";

type Tab = OrderStatus | "all" | "issues";

export function OrdersPage({ initialTab }: { initialTab?: Tab }) {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const selectedId = useRestaurantStore((s) => s.selectedId);
  const loading = useOrderStore((s) => s.loading);
  const error = useOrderStore((s) => s.error);
  const load = useOrderStore((s) => s.load);
  const orders = useOrderStore((s) => s.orders);
  const counts = useMemo(() => {
    const list = orders.filter((order) => order.restaurantId === selectedId);
    return {
      all: list.length,
      new: list.filter((order) => order.status === "new").length,
      preparing: list.filter((order) => order.status === "preparing").length,
      ready: list.filter((order) => order.status === "ready").length,
      completed: list.filter((order) => order.status === "completed").length,
      cancelled: list.filter((order) => order.status === "cancelled").length,
      issues: list.filter((order) => order.issues.length > 0).length,
    };
  }, [orders, selectedId]);
  const filterLocal = useOrderStore((s) => s.filterLocal);
  const toast = useUiStore((s) => s.toast);
  const persisted = readJson<{ query: string; tab: Tab }>(STORAGE_KEYS.filters, { query: "", tab: "all" });
  const [query, setQuery] = useState(persisted.query);
  // The dashboard's "Issues" and "Orders Today" cards link here with a query
  // param. Those links promise "show me everything matching this", so they
  // must not silently inherit whatever tab was last persisted from unrelated
  // browsing — only fall back to the persisted tab for plain navigation.
  const [tab, setTab] = useState<Tab>(() => {
    if (initialTab) return initialTab;
    if (params.get("issue") === "1") return "issues";
    if (params.get("today") === "1") return "all";
    return persisted.tab;
  });
  const [filterOpen, setFilterOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [source, setSource] = useState<OrderSource | "all">("all");
  const [fulfilment, setFulfilment] = useState<FulfilmentType | "all">("all");
  const [customer, setCustomer] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [page, setPage] = useState(1);
  const [todayOnly, setTodayOnly] = useState(() => params.get("today") === "1");
  const pageSize = 10;
  const orderId = params.get("orderId");
  const selectedNumber = orderId ? Number(orderId) : null;

  useEffect(() => {
    writeJson(STORAGE_KEYS.filters, { query, tab });
  }, [query, tab]);

  const filtered = useMemo(() => {
    return filterLocal({
      restaurantId: selectedId,
      status: tab === "issues" ? "all" : tab,
      source,
      fulfilment,
      query,
      customer,
      minAmount: minAmount ? Number(minAmount) : undefined,
      maxAmount: maxAmount ? Number(maxAmount) : undefined,
      issuesOnly: tab === "issues",
      today: todayOnly,
    });
  }, [filterLocal, selectedId, tab, source, fulfilment, query, customer, minAmount, maxAmount, todayOnly]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const activeFilterCount = [source !== "all", fulfilment !== "all", Boolean(customer), Boolean(minAmount), Boolean(maxAmount)].filter(Boolean).length;

  function openOrder(number: number) {
    const next = new URLSearchParams(params);
    next.set("orderId", String(number));
    setParams(next);
  }

  function closeOrder() {
    const next = new URLSearchParams(params);
    next.delete("orderId");
    setParams(next);
  }

  async function exportOrders() {
    await sleep(500);
    setExportOpen(false);
    toast("success", t("orders.exported"));
  }

  return (
    <div>
      <PageHeader
        title={t("orders.title")}
        actions={
          <>
            <SearchInput placeholder={t("orders.search")} value={query} onChange={(e) => setQuery(e.target.value)} wrapperClassName="w-56" />
            <Button variant="secondary" onClick={() => setFilterOpen(true)}>
              <Filter className="h-4 w-4" /> {t("common.filters")}
              {activeFilterCount ? (
                <span className="ml-1 rounded-full bg-primary px-1.5 text-[11px] text-white">{activeFilterCount}</span>
              ) : null}
            </Button>
            <Button variant="secondary" onClick={() => setExportOpen(true)}>
              <Download className="h-4 w-4" /> {t("common.export")}
            </Button>
          </>
        }
      />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "all", label: t("common.all"), count: counts.all },
          { id: "new", label: t("orders.statusNew"), count: counts.new },
          { id: "preparing", label: t("orders.statusPreparing"), count: counts.preparing },
          { id: "ready", label: t("orders.statusReady"), count: counts.ready },
          { id: "completed", label: t("orders.statusCompleted"), count: counts.completed },
          { id: "cancelled", label: t("orders.statusCancelled"), count: counts.cancelled },
          { id: "issues", label: t("orders.issuesLabel"), count: counts.issues },
        ]}
      />
      {todayOnly ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => setTodayOnly(false)} className="inline-flex items-center gap-1 rounded-full bg-info-muted px-2.5 py-1 text-xs font-medium text-info">
            {t("orders.todayOnly")} ×
          </button>
        </div>
      ) : null}
      <Card className="mt-4" padding={false}>
        {loading && !filtered.length ? (
          <div className="p-4">
            <TableSkeleton />
          </div>
        ) : error ? (
          <ErrorState title={t("orders.unableToLoad")} description={t("orders.loadError")} onRetry={() => void load(selectedId)} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Search className="h-8 w-8" />}
            title={query || activeFilterCount ? t("orders.noResults") : t("orders.noOrders")}
            description={t("orders.emptyHint")}
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted">
                  <tr className="border-b border-border">
                    {[t("orders.order"), t("orders.source"), t("orders.fulfilment"), t("orders.items"), t("orders.total"), t("orders.status"), t("orders.waitingTime"), t("orders.actions")].map((h) => (
                      <th key={h} className="px-4 py-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((order) => (
                    <tr key={order.id} className="cursor-pointer border-b border-border/70 hover:bg-card-hover" onClick={() => openOrder(order.number)}>
                      <td className="px-4 py-3 font-medium">
                        #{order.number}
                        {order.issues.length > 0 ? <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-danger" aria-label={t("orders.issuesLabel")} /> : null}
                      </td>
                      <td className="px-4 py-3"><SourceIcon source={order.source} /></td>
                      <td className="px-4 py-3 text-muted">{order.fulfilment === "pickup" ? t("orders.pickup") : t("orders.delivery")}</td>
                      <td className="px-4 py-3">{itemCountLabel(order.items.length)}</td>
                      <td className="px-4 py-3">{formatEuro(order.total)}</td>
                      <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                      <td className="px-4 py-3"><WaitingBadge createdAt={order.createdAt} /></td>
                      <td className="px-4 py-3">
                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); openOrder(order.number); }}>
                          {t("common.view")}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-2 p-3 md:hidden">
              {rows.map((order) => (
                <button key={order.id} type="button" className="w-full rounded-lg border border-border bg-surface-2 p-3 text-left" onClick={() => openOrder(order.number)}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">#{order.number}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {itemCountLabel(order.items.length)} · {formatEuro(order.total)}
                  </p>
                  <div className="mt-1"><WaitingBadge createdAt={order.createdAt} /></div>
                </button>
              ))}
            </div>
            <Pagination page={Math.min(page, pageCount)} pageCount={pageCount} onPage={setPage} />
          </>
        )}
      </Card>

      <OrderDetailsDrawer
        orderNumber={Number.isFinite(selectedNumber) ? selectedNumber : null}
        onClose={closeOrder}
      />

      <Modal open={filterOpen} title={t("common.filters")} onClose={() => setFilterOpen(false)}>
        <div className="space-y-3">
          <FormField label={t("orders.channel")}>
            <Select value={source} onChange={(e) => setSource(e.target.value as OrderSource | "all")}>
              <option value="all">{t("common.all")}</option>
              {ORDER_CHANNELS.map((channel) => (
                <option key={channel} value={channel}>{t(sourceLabelKey(channel))}</option>
              ))}
            </Select>
          </FormField>
          <FormField label={t("orders.fulfilment")}>
            <Select value={fulfilment} onChange={(e) => setFulfilment(e.target.value as FulfilmentType | "all")}>
              <option value="all">{t("common.all")}</option>
              <option value="pickup">{t("orders.pickup")}</option>
              <option value="delivery">{t("orders.delivery")}</option>
            </Select>
          </FormField>
          <FormField label={t("orders.customer")}>
            <TextInput value={customer} onChange={(e) => setCustomer(e.target.value)} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label={t("orders.amount") + " min"}>
              <TextInput type="number" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} />
            </FormField>
            <FormField label={t("orders.amount") + " max"}>
              <TextInput type="number" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} />
            </FormField>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              setSource("all");
              setFulfilment("all");
              setCustomer("");
              setMinAmount("");
              setMaxAmount("");
              setTodayOnly(false);
            }}
          >
            {t("orders.clearFilters")}
          </Button>
          <Button onClick={() => setFilterOpen(false)}>{t("common.apply")}</Button>
        </div>
      </Modal>

      <Modal open={exportOpen} title={t("common.export") + " " + t("orders.title")} onClose={() => setExportOpen(false)}>
        <FormField label={t("common.export")}>
          <Select value={format} onChange={(e) => setFormat(e.target.value as ExportFormat)}>
            <option value="csv">CSV</option>
            <option value="excel">Excel</option>
            <option value="pdf">PDF</option>
          </Select>
        </FormField>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setExportOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={() => void exportOrders()}>{t("common.export")}</Button>
        </div>
      </Modal>
    </div>
  );
}

export function NewOrdersPage() {
  return <OrdersPage initialTab="new" />;
}

export function PreparingOrdersPage() {
  return <OrdersPage initialTab="preparing" />;
}

export function ReadyOrdersPage() {
  return <OrdersPage initialTab="ready" />;
}

export function CompletedOrdersPage() {
  return <OrdersPage initialTab="completed" />;
}
