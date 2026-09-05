import { useEffect, useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Toggle } from "@/components/ui/FormField";
import { ConfirmModal } from "@/components/modals/Modal";
import { capacityRepository } from "@/services/api/opsRepository";
import { useOrderStore } from "@/stores/orderStore";
import { useRestaurantStore } from "@/stores/restaurantStore";
import { useUiStore } from "@/stores/uiStore";
import type { CapacityState } from "@/types";

export function CapacityPage() {
  const restaurantId = useRestaurantStore((s) => s.selectedId);
  const orders = useOrderStore((s) => s.orders);
  const kpis = useMemo(() => {
    const list = orders.filter((order) => order.restaurantId === restaurantId);
    return {
      new: list.filter((order) => order.status === "new").length,
      preparing: list.filter((order) => order.status === "preparing").length,
      ready: list.filter((order) => order.status === "ready").length,
    };
  }, [orders, restaurantId]);
  const toast = useUiStore((s) => s.toast);
  const [state, setState] = useState<CapacityState | null>(null);
  const [pending, setPending] = useState<number | null>(null);

  useEffect(() => {
    void capacityRepository.get(restaurantId).then(setState);
  }, [restaurantId]);

  const current = kpis.new + kpis.preparing + kpis.ready;
  const available = Math.max(0, (state?.maxPerHour ?? 0) - current);

  const preview = useMemo(() => pending ?? state?.maxPerHour ?? 20, [pending, state]);

  if (!state) return null;

  return (
    <div>
      <PageHeader title="Capacity" description="Control how many orders the kitchen can handle this hour." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Maximum Orders" value={`${state.maxPerHour}/hr`} icon={<Plus className="h-4 w-4" />} />
        <StatCard label="Current Orders" value={current} tone="warning" icon={<Plus className="h-4 w-4" />} />
        <StatCard label="Preparing Orders" value={kpis.preparing} tone="warning" icon={<Plus className="h-4 w-4" />} />
        <StatCard label="Available Capacity" value={available} tone="success" icon={<Plus className="h-4 w-4" />} />
      </div>
      <Card className="mt-5 max-w-xl space-y-4">
        <p className="text-sm text-muted">Current capacity</p>
        <p className="text-3xl font-semibold">{state.maxPerHour} orders / hour</p>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setPending(Math.max(1, state.maxPerHour - 1))}>
            <Minus className="h-4 w-4" /> Decrease
          </Button>
          <Button onClick={() => setPending(state.maxPerHour + 1)}>
            <Plus className="h-4 w-4" /> Increase
          </Button>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3 py-2">
          <div>
            <p className="text-sm font-medium">Enable automatic capacity</p>
            <p className="text-xs text-muted">Adjusts max orders from kitchen load.</p>
          </div>
          <Toggle
            checked={state.autoCapacity}
            onChange={async (autoCapacity) => {
              const next = { ...state, autoCapacity };
              await capacityRepository.save(next);
              setState(next);
              toast("success", autoCapacity ? "Automatic capacity enabled" : "Automatic capacity disabled");
            }}
          />
        </div>
      </Card>
      <ConfirmModal
        open={pending !== null}
        title="Update Capacity?"
        description={`Current: ${state.maxPerHour}. New: ${preview}.`}
        confirmLabel="Confirm"
        onCancel={() => setPending(null)}
        onConfirm={async () => {
          if (pending === null) return;
          const next = { ...state, maxPerHour: pending };
          await capacityRepository.save(next);
          setState(next);
          setPending(null);
          toast("success", "Capacity updated");
        }}
      />
    </div>
  );
}
