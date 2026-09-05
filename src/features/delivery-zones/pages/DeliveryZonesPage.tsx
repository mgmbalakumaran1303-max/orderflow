import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SearchInput } from "@/components/ui/SearchInput";
import { Badge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/Tabs";
import { ConfirmModal, Modal } from "@/components/modals/Modal";
import { FormField, TextInput, Toggle } from "@/components/ui/FormField";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { deliveryZoneRepository } from "@/services/api/deliveryZoneRepository";
import { useRestaurantStore } from "@/stores/restaurantStore";
import { useUiStore } from "@/stores/uiStore";
import { formatEuro } from "@/utils/format";
import type { DeliveryZone } from "@/types";

export function DeliveryZonesPage() {
  const restaurantId = useRestaurantStore((s) => s.selectedId);
  const toast = useUiStore((s) => s.toast);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<DeliveryZone | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [draft, setDraft] = useState({ postcode: "", minOrder: "15", deliveryFee: "2.5", freeOver: "45", active: true });

  async function reload() {
    setLoading(true);
    const list = await deliveryZoneRepository.list(restaurantId);
    setZones(list);
    setSelected((prev) => list.find((z) => z.id === prev?.id) ?? list[0] ?? null);
    setLoading(false);
  }

  useEffect(() => {
    void reload();
  }, [restaurantId]);

  const visible = zones.filter((zone) => zone.postcode.includes(query));

  function openCreate() {
    setSelected(null);
    setDraft({ postcode: "", minOrder: "15", deliveryFee: "2.5", freeOver: "45", active: true });
    setEditOpen(true);
  }

  function openEdit(zone: DeliveryZone) {
    setSelected(zone);
    setDraft({
      postcode: zone.postcode,
      minOrder: String(zone.minOrder),
      deliveryFee: String(zone.deliveryFee),
      freeOver: String(zone.freeOver),
      active: zone.active,
    });
    setEditOpen(true);
  }

  return (
    <div>
      <PageHeader title="Delivery Zones" actions={<Button onClick={openCreate}>Add Zone</Button>} />
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card padding={false}>
          <div className="p-4">
            <SearchInput placeholder="Search postcode..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          {loading ? (
            <div className="p-4"><TableSkeleton rows={4} /></div>
          ) : visible.length === 0 ? (
            <EmptyState icon={<MapPin className="h-8 w-8" />} title="No delivery zones" description="Add a postcode to start delivering." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted">
                  <tr className="border-y border-border">
                    {["Postcode", "Min Order", "Delivery Fee", "Free Over", "Status"].map((h) => (
                      <th key={h} className="px-4 py-2 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visible.map((zone) => (
                    <tr key={zone.id} className={`cursor-pointer hover:bg-card-hover ${selected?.id === zone.id ? "bg-surface-2" : ""}`} onClick={() => setSelected(zone)}>
                      <td className="px-4 py-3 font-medium">{zone.postcode}</td>
                      <td className="px-4 py-3">{formatEuro(zone.minOrder)}</td>
                      <td className="px-4 py-3">{formatEuro(zone.deliveryFee)}</td>
                      <td className="px-4 py-3">{formatEuro(zone.freeOver)}</td>
                      <td className="px-4 py-3">
                        <Badge tone={zone.active ? "success" : "neutral"}>{zone.active ? "Active" : "Inactive"}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {selected ? (
            <div className="flex gap-2 border-t border-border p-3">
              <Button size="sm" variant="secondary" onClick={() => openEdit(selected)}>Edit Zone</Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={async () => {
                  await deliveryZoneRepository.save({ ...selected, active: !selected.active });
                  await reload();
                  toast("success", selected.active ? "Zone deactivated" : "Zone activated");
                }}
              >
                Toggle {selected.active ? "Inactive" : "Active"}
              </Button>
              <Button size="sm" variant="danger" onClick={() => setDeleteOpen(true)}>Delete Zone</Button>
            </div>
          ) : null}
        </Card>
        <Card className="min-h-[360px]">
          <p className="mb-3 text-sm font-semibold">Coverage map</p>
          <div className="relative h-[300px] overflow-hidden rounded-xl border border-border bg-[radial-gradient(circle_at_30%_40%,#1d4d6a,transparent_42%),linear-gradient(180deg,#0d1b28,#06111b)]">
            <div className="absolute left-[28%] top-[34%] h-24 w-24 rounded-full border border-primary/40 bg-primary/10" />
            <div className="absolute left-[48%] top-[42%] h-16 w-16 rounded-full border border-info/40 bg-info/10" />
            <div className="absolute bottom-3 left-3 rounded-lg bg-card/90 px-3 py-2 text-xs text-muted">
              {selected ? `Selected ${selected.postcode}` : "Select a zone"}
            </div>
          </div>
        </Card>
      </div>
      <Modal open={editOpen} title={selected ? "Edit Zone" : "Add Zone"} onClose={() => setEditOpen(false)}>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Postcode">
            <TextInput value={draft.postcode} onChange={(e) => setDraft({ ...draft, postcode: e.target.value })} />
          </FormField>
          <FormField label="Min Order">
            <TextInput type="number" value={draft.minOrder} onChange={(e) => setDraft({ ...draft, minOrder: e.target.value })} />
          </FormField>
          <FormField label="Delivery Fee">
            <TextInput type="number" value={draft.deliveryFee} onChange={(e) => setDraft({ ...draft, deliveryFee: e.target.value })} />
          </FormField>
          <FormField label="Free Over">
            <TextInput type="number" value={draft.freeOver} onChange={(e) => setDraft({ ...draft, freeOver: e.target.value })} />
          </FormField>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm">Active</span>
          <Toggle checked={draft.active} onChange={(active) => setDraft({ ...draft, active })} />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button
            onClick={async () => {
              const payload = {
                restaurantId,
                postcode: draft.postcode,
                minOrder: Number(draft.minOrder),
                deliveryFee: Number(draft.deliveryFee),
                freeOver: Number(draft.freeOver),
                active: draft.active,
              };
              if (selected) await deliveryZoneRepository.save({ ...selected, ...payload });
              else await deliveryZoneRepository.create(payload);
              setEditOpen(false);
              await reload();
              toast("success", "Delivery zone saved");
            }}
          >
            Save
          </Button>
        </div>
      </Modal>
      <ConfirmModal
        open={deleteOpen}
        title="Delete Zone?"
        description="This postcode will no longer be deliverable."
        confirmLabel="Delete"
        variant="danger"
        onCancel={() => setDeleteOpen(false)}
        onConfirm={async () => {
          if (!selected) return;
          await deliveryZoneRepository.remove(selected.id);
          setDeleteOpen(false);
          await reload();
          toast("success", "Zone deleted");
        }}
      />
    </div>
  );
}
