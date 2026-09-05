import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { ChartSkeleton, CardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/Tabs";
import { Modal } from "@/components/modals/Modal";
import { FormField, Select } from "@/components/ui/FormField";
import { reportRepository, type ReportSummary } from "@/services/api/reportRepository";
import { useRestaurantStore } from "@/stores/restaurantStore";
import { useUiStore } from "@/stores/uiStore";
import { formatEuro, sleep, sourceLabel } from "@/utils/format";
import { BarChart3, Download } from "lucide-react";
import type { ExportFormat } from "@/types";
import { subDays } from "date-fns";

export function ReportsPage() {
  const restaurantId = useRestaurantStore((s) => s.selectedId);
  const toast = useUiStore((s) => s.toast);
  const [from, setFrom] = useState(() => subDays(new Date(), 7));
  const [to, setTo] = useState(() => new Date());
  const [data, setData] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>("pdf");

  useEffect(() => {
    setLoading(true);
    void reportRepository.summarize(restaurantId, from, to).then((summary) => {
      setData(summary);
      setLoading(false);
    });
  }, [restaurantId, from, to]);

  return (
    <div>
      <PageHeader
        title="Reports"
        actions={
          <>
            <input className="h-9 rounded-lg border border-border bg-card px-2 text-sm" type="date" value={from.toISOString().slice(0, 10)} onChange={(e) => setFrom(new Date(e.target.value))} />
            <input className="h-9 rounded-lg border border-border bg-card px-2 text-sm" type="date" value={to.toISOString().slice(0, 10)} onChange={(e) => setTo(new Date(e.target.value))} />
            <Button variant="secondary" onClick={() => setExportOpen(true)}>
              <Download className="h-4 w-4" /> Export
            </Button>
          </>
        }
      />
      {loading || !data ? (
        <div className="space-y-4">
          <CardSkeleton />
          <ChartSkeleton />
        </div>
      ) : data.totalOrders === 0 ? (
        <EmptyState icon={<BarChart3 className="h-8 w-8" />} title="No reports" description="No orders in this date range." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Orders" value={data.totalOrders} icon={<BarChart3 className="h-4 w-4" />} />
            <StatCard label="Total Revenue" value={formatEuro(data.totalRevenue)} tone="success" icon={<BarChart3 className="h-4 w-4" />} />
            <StatCard label="Average Order Value" value={formatEuro(data.averageOrderValue)} tone="info" icon={<BarChart3 className="h-4 w-4" />} />
            <StatCard label="Cancelled Orders" value={data.cancelledOrders} tone="warning" icon={<BarChart3 className="h-4 w-4" />} />
          </div>
          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            <Card>
              <h2 className="mb-3 text-sm font-semibold">Orders Trend</h2>
              <div className="h-56">
                <ResponsiveContainer>
                  <LineChart data={data.trend}>
                    <CartesianGrid stroke="var(--border)" />
                    <XAxis dataKey="date" stroke="var(--muted)" fontSize={12} />
                    <YAxis stroke="var(--muted)" fontSize={12} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)" }} />
                    <Line type="monotone" dataKey="orders" stroke="#f97316" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card>
              <h2 className="mb-3 text-sm font-semibold">Revenue Trend</h2>
              <div className="h-56">
                <ResponsiveContainer>
                  <LineChart data={data.trend}>
                    <CartesianGrid stroke="var(--border)" />
                    <XAxis dataKey="date" stroke="var(--muted)" fontSize={12} />
                    <YAxis stroke="var(--muted)" fontSize={12} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)" }} />
                    <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card>
              <h2 className="mb-3 text-sm font-semibold">Orders by Source</h2>
              <div className="h-56">
                <ResponsiveContainer>
                  <BarChart data={data.bySource.map((row) => ({ ...row, name: sourceLabel(row.source) }))}>
                    <CartesianGrid stroke="var(--border)" />
                    <XAxis dataKey="name" stroke="var(--muted)" fontSize={12} />
                    <YAxis stroke="var(--muted)" fontSize={12} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)" }} />
                    <Bar dataKey="count" fill="#f97316" radius={6} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card>
              <h2 className="mb-3 text-sm font-semibold">Cancellation Trend</h2>
              <div className="h-56">
                <ResponsiveContainer>
                  <LineChart data={data.trend}>
                    <CartesianGrid stroke="var(--border)" />
                    <XAxis dataKey="date" stroke="var(--muted)" fontSize={12} />
                    <YAxis stroke="var(--muted)" fontSize={12} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)" }} />
                    <Line type="monotone" dataKey="cancelled" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </>
      )}
      <Modal open={exportOpen} title="Export Report" onClose={() => setExportOpen(false)}>
        <FormField label="Format">
          <Select value={format} onChange={(e) => setFormat(e.target.value as ExportFormat)}>
            <option value="pdf">PDF</option>
            <option value="csv">CSV</option>
            <option value="excel">Excel</option>
          </Select>
        </FormField>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setExportOpen(false)}>Cancel</Button>
          <Button
            onClick={async () => {
              await sleep(400);
              setExportOpen(false);
              toast("success", "Export completed");
            }}
          >
            Export
          </Button>
        </div>
      </Modal>
    </div>
  );
}
