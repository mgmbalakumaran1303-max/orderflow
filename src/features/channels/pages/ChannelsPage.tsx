import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/StatusBadge";
import { Toggle } from "@/components/ui/FormField";
import { Drawer } from "@/components/drawers/Drawer";
import { ConfirmModal } from "@/components/modals/Modal";
import { channelRepository } from "@/services/api/opsRepository";
import { useUiStore } from "@/stores/uiStore";
import { formatRelative } from "@/utils/format";
import type { Channel } from "@/types";

export function ChannelsPage() {
  const toast = useUiStore((s) => s.toast);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [active, setActive] = useState<Channel | null>(null);
  const [disconnectOpen, setDisconnectOpen] = useState(false);

  async function reload() {
    setChannels(await channelRepository.list());
  }

  useEffect(() => {
    void reload();
  }, []);

  return (
    <div>
      <PageHeader title="Channels" description="Connected order sources." />
      <div className="grid gap-4 md:grid-cols-2">
        {channels.map((channel) => (
          <Card key={channel.id} hover>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold">{channel.name}</h2>
                <p className="mt-1 text-sm text-muted">Last sync {formatRelative(channel.lastSync)}</p>
              </div>
              <Badge tone={channel.connected ? "success" : "danger"}>{channel.connected ? "Connected" : "Offline"}</Badge>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <span>Enable</span>
                <Toggle
                  checked={channel.enabled}
                  onChange={async (enabled) => {
                    await channelRepository.save({ ...channel, enabled });
                    await reload();
                  }}
                />
              </div>
              <Button variant="secondary" onClick={() => setActive(channel)}>Configure</Button>
            </div>
          </Card>
        ))}
      </div>
      <Drawer open={Boolean(active)} title={active?.name ?? "Channel"} onClose={() => setActive(null)}>
        {active ? (
          <div className="space-y-4 p-5">
            <p className="text-sm">Connection status: {active.connected ? "Connected" : "Offline"}</p>
            <p className="text-sm">API status: {active.apiStatus}</p>
            <p className="text-sm">Last synchronization: {formatRelative(active.lastSync)}</p>
            <div className="flex items-center justify-between">
              <span>Enable orders</span>
              <Toggle checked={active.enabled} onChange={(enabled) => setActive({ ...active, enabled })} />
            </div>
            <div className="flex items-center justify-between">
              <span>Auto accept</span>
              <Toggle checked={active.autoAccept} onChange={(autoAccept) => setActive({ ...active, autoAccept })} />
            </div>
            <div className="flex items-center justify-between">
              <span>Auto print</span>
              <Toggle checked={active.autoPrint} onChange={(autoPrint) => setActive({ ...active, autoPrint })} />
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={async () => {
                  await channelRepository.save(active);
                  await reload();
                  toast("success", "Channel saved");
                  setActive(null);
                }}
              >
                Save
              </Button>
              <Button variant="danger" onClick={() => setDisconnectOpen(true)}>Disconnect</Button>
            </div>
          </div>
        ) : null}
      </Drawer>
      <ConfirmModal
        open={disconnectOpen}
        title="Disconnect channel?"
        description="Incoming orders from this source will stop until you reconnect."
        confirmLabel="Disconnect"
        variant="danger"
        onCancel={() => setDisconnectOpen(false)}
        onConfirm={async () => {
          if (!active) return;
          await channelRepository.disconnect(active.id);
          setDisconnectOpen(false);
          setActive(null);
          await reload();
          toast("warning", "Channel disconnected");
        }}
      />
    </div>
  );
}
