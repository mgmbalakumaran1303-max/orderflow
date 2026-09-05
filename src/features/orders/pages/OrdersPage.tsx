import { useEffect, useMemo, useState } from "react";
import { Download, Filter, Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { Tabs, EmptyState, ErrorState } from "@/components/ui/Tabs";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SourceIcon } from "@/components/ui/SourceIcon";
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
import { formatEuro, formatRelative, itemCountLabel, sleep } from "@/utils/format";
import type { ExportFormat, OrderSource, OrderStatus } from "@/types";

type Tab = OrderStatus | "all";

export function OrdersPage() {
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
    };
  }, [orders, selectedId]);
  const filterLocal = useOrderStore((s) => s.filterLocal);
  const toast = useUiStore((s) => s.toast);
  const persisted = readJson<{ query: string; tab: Tab }>(STORAGE_KEYS.filters, { query: "", tab: "all" });
  const [query, setQuery] = useState(persisted.query);
  const [tab, setTab] = useState<Tab>(persisted.tab);
  const [filterOpen, setFilterOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [source, setSource] = useState<OrderSource | "all">("all");
  const [customer, setCustomer] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const orderId = params.get("orderId");
  const selectedNumber = orderId ? Number(orderId) : null;

  useEffect(() => {
    writeJson(STORAGE_KEYS.filters, { query, tab });
  }, [query, tab]);

  const filtered = useMemo(() => {
    return filterLocal({
      restaurantId: selectedId,
      status: tab,
      source,
      query,
      customer,
      minAmount: minAmount ? Number(minAmount) : undefined,
      maxAmount: maxAmount ? Number(maxAmount) : undefined,
    });
  }, [filterLocal, selectedId, tab, source, query, customer, minAmount, maxAmount]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  function openOrder(number: number) {
    setParams({ orderId: String(number) });
  }

  async function exportOrders() {
    await sleep(500);
    setExportOpen(false);
    toast("success", "Orders exported successfully.");
  }

  return (
    <div>
      <PageHeader
        title="Orders"
        actions={
          <>
            <SearchInput placeholder="Search orders..." value={query} onChange={(e) => setQuery(e.target.value)} wrapperClassName="w-56" />
            <Button variant="secondary" onClick={() => setFilterOpen(true)}>
              <Filter className="h-4 w-4" /> Filters
            </Button>
            <Button variant="secondary" onClick={() => setExportOpen(true)}>
              <Download className="h-4 w-4" /> Export
            </Button>
          </>
        }
      />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "all", label: "All", count: counts.all },
          { id: "new", label: "New", count: counts.new },
          { id: "preparing", label: "Preparing", count: counts.preparing },
          { id: "ready", label: "Ready", count: counts.ready },
          { id: "completed", label: "Completed", count: counts.completed },
          { id: "cancelled", label: "Cancelled", count: counts.cancelled },
        ]}
      />
      <Card className="mt-4" padding={false}>
        {loading && !filtered.length ? (
          <div className="p-4">
            <TableSkeleton />
          </div>
        ) : error ? (
          <ErrorState title="Unable to load orders." description="Something went wrong while loading the data." onRetry={() => void load(selectedId)} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Search className="h-8 w-8" />}
            title={query ? "No results found" : "No orders found"}
            description="Try adjusting search or filters to see incoming tickets."
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted">
                  <tr className="border-b border-border">
                    {["Order", "Source", "Items", "Total", "Status", "Time", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((order) => (
                    <tr key={order.id} className="cursor-pointer border-b border-border/70 hover:bg-card-hover" onClick={() => openOrder(order.number)}>
                      <td className="px-4 py-3 font-medium">#{order.number}</td>
                      <td className="px-4 py-3"><SourceIcon source={order.source} /></td>
                      <td className="px-4 py-3">{itemCountLabel(order.items.length)}</td>
                      <td className="px-4 py-3">{formatEuro(order.total)}</td>
                      <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                      <td className="px-4 py-3 text-muted">{formatRelative(order.createdAt)}</td>
                      <td className="px-4 py-3">
                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); openOrder(order.number); }}>
                          View
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
                </button>
              ))}
            </div>
            <Pagination page={Math.min(page, pageCount)} pageCount={pageCount} onPage={setPage} />
          </>
        )}
      </Card>

      <OrderDetailsDrawer
        orderNumber={Number.isFinite(selectedNumber) ? selectedNumber : null}
        onClose={() => setParams({})}
      />

      <Modal open={filterOpen} title="Filters" onClose={() => setFilterOpen(false)}>
        <div className="space-y-3">
          <FormField label="Source">
            <Select value={source} onChange={(e) => setSource(e.target.value as OrderSource | "all")}>
              <option value="all">All</option>
              <option value="uber-eats">Uber Eats</option>
              <option value="wolt">Wolt</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="website">Website</option>
              <option value="other">Other</option>
            </Select>
          </FormField>
          <FormField label="Customer">
            <TextInput value={customer} onChange={(e) => setCustomer(e.target.value)} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Min amount">
              <TextInput type="number" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} />
            </FormField>
            <FormField label="Max amount">
              <TextInput type="number" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} />
            </FormField>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              setSource("all");
              setCustomer("");
              setMinAmount("");
              setMaxAmount("");
            }}
          >
            Clear
          </Button>
          <Button onClick={() => setFilterOpen(false)}>Apply Filters</Button>
        </div>
      </Modal>

      <Modal open={exportOpen} title="Export Orders" onClose={() => setExportOpen(false)}>
        <FormField label="Format">
          <Select value={format} onChange={(e) => setFormat(e.target.value as ExportFormat)}>
            <option value="csv">CSV</option>
            <option value="excel">Excel</option>
            <option value="pdf">PDF</option>
          </Select>
        </FormField>
        <FormField label="Date range">
          <TextInput type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
        </FormField>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setExportOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => void exportOrders()}>Export</Button>
        </div>
      </Modal>
    </div>
  );
}
