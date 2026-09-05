import { useEffect, useState } from "react";
import { Tablet } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/Tabs";
import { Drawer } from "@/components/drawers/Drawer";
import { ConfirmModal, Modal } from "@/components/modals/Modal";
import { FormField, TextInput } from "@/components/ui/FormField";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { deviceRepository } from "@/services/api/deviceRepository";
import { useUiStore } from "@/stores/uiStore";
import { formatRelative } from "@/utils/format";
import type { Device } from "@/types";

export function DevicesPage() {
  const toast = useUiStore((s) => s.toast);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Device | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [disconnectOpen, setDisconnectOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [name, setName] = useState("");

  async function reload() {
    setLoading(true);
    const list = await deviceRepository.list();
    setDevices(list);
    setActive((prev) => list.find((d) => d.id === prev?.id) ?? prev);
    setLoading(false);
  }

  useEffect(() => {
    void reload();
  }, []);

  return (
    <div>
      <PageHeader title="Devices" />
      <Card padding={false}>
        {loading ? (
          <div className="p-4"><TableSkeleton /></div>
        ) : devices.length === 0 ? (
          <EmptyState icon={<Tablet className="h-8 w-8" />} title="No devices" description="Register an order pad or kitchen display." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted">
                <tr className="border-b border-border">
                  {["Device", "Device ID", "Restaurant", "Status", "Last Seen", "Version", "Printer"].map((h) => (
                    <th key={h} className="px-4 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {devices.map((device) => (
                  <tr key={device.id} className="cursor-pointer border-b border-border/70 hover:bg-card-hover" onClick={() => setActive(device)}>
                    <td className="px-4 py-3 font-medium">{device.name}</td>
                    <td className="px-4 py-3 text-muted">{device.deviceId}</td>
                    <td className="px-4 py-3">{device.restaurantName}</td>
                    <td className="px-4 py-3">
                      <Badge tone={device.status === "connected" ? "success" : "danger"}>{device.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted">{formatRelative(device.lastSeen)}</td>
                    <td className="px-4 py-3">{device.version}</td>
                    <td className="px-4 py-3">{device.printer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <Drawer open={Boolean(active)} title={active?.name ?? "Device"} onClose={() => setActive(null)}>
        {active ? (
          <div className="space-y-3 p-5 text-sm">
            <p>Device ID: {active.deviceId}</p>
            <p>Restaurant: {active.restaurantName}</p>
            <p>Connection: {active.status}</p>
            <p>Printer: {active.printer}</p>
            <p>Application version: {active.version}</p>
            <p>Last synchronization: {formatRelative(active.lastSeen)}</p>
            <p className="rounded-lg border border-border bg-card p-3 text-muted">Activity: heartbeat received, 12 tickets printed today.</p>
            <div className="flex flex-col gap-2 pt-2">
              <Button
                variant="secondary"
                onClick={async () => {
                  await deviceRepository.save({ ...active, status: "connected", lastSeen: new Date().toISOString() });
                  await reload();
                  toast("success", "Connection restored");
                }}
              >
                Reconnect
              </Button>
              <Button variant="secondary" onClick={() => { setName(active.name); setEditOpen(true); }}>Edit</Button>
              <Button variant="secondary" onClick={() => setDisconnectOpen(true)}>Disconnect</Button>
              <Button variant="danger" onClick={() => setRemoveOpen(true)}>Remove Device</Button>
            </div>
          </div>
        ) : null}
      </Drawer>
      <Modal open={editOpen} title="Edit Device" onClose={() => setEditOpen(false)}>
        <FormField label="Device name">
          <TextInput value={name} onChange={(e) => setName(e.target.value)} />
        </FormField>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button
            onClick={async () => {
              if (!active) return;
              await deviceRepository.save({ ...active, name });
              setEditOpen(false);
              await reload();
              toast("success", "Device updated");
            }}
          >
            Save
          </Button>
        </div>
      </Modal>
      <ConfirmModal
        open={disconnectOpen}
        title="Disconnect device?"
        description="This pad will stop receiving orders until reconnected."
        confirmLabel="Disconnect"
        variant="danger"
        onCancel={() => setDisconnectOpen(false)}
        onConfirm={async () => {
          if (!active) return;
          await deviceRepository.save({ ...active, status: "disconnected" });
          setDisconnectOpen(false);
          await reload();
          toast("warning", "Device disconnected");
        }}
      />
      <ConfirmModal
        open={removeOpen}
        title="Remove Device?"
        description="The device registration will be deleted."
        confirmLabel="Remove Device"
        variant="danger"
        onCancel={() => setRemoveOpen(false)}
        onConfirm={async () => {
          if (!active) return;
          await deviceRepository.remove(active.id);
          setRemoveOpen(false);
          setActive(null);
          await reload();
          toast("success", "Device removed");
        }}
      />
    </div>
  );
}
