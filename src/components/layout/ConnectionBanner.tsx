import { useEffect, useState } from "react";
import { AlertTriangle, WifiOff, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { channelRepository } from "@/services/api/opsRepository";
import { deviceRepository } from "@/services/api/deviceRepository";
import { CONNECTION_POLL_INTERVAL_MS } from "@/constants/orders";
import { cn } from "@/utils/format";
import type { Channel, Device } from "@/types";

export function ConnectionBanner() {
  const { t } = useTranslation();
  const [disconnectedChannels, setDisconnectedChannels] = useState<Channel[]>([]);
  const [disconnectedDevices, setDisconnectedDevices] = useState<Device[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [offline, setOffline] = useState(typeof navigator !== "undefined" ? !navigator.onLine : false);

  useEffect(() => {
    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  // Fetch raw connection state only — translation happens at render time below,
  // so a language switch updates the banner immediately instead of waiting for
  // the next poll tick.
  useEffect(() => {
    let cancelled = false;

    async function poll() {
      const [channels, devices] = await Promise.all([channelRepository.list(), deviceRepository.list()]);
      if (cancelled) return;
      setDisconnectedChannels(channels.filter((channel) => !channel.connected || channel.apiStatus === "offline"));
      setDisconnectedDevices(devices.filter((device) => device.status === "disconnected"));
    }

    void poll();
    const interval = window.setInterval(() => void poll(), CONNECTION_POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const rows: Array<{ id: string; critical: boolean; icon: typeof AlertTriangle; title: string; description: string }> = [];
  if (offline) {
    rows.push({
      id: "offline",
      critical: true,
      icon: WifiOff,
      title: t("connection.offlineTitle"),
      description: t("connection.offlineBody"),
    });
  }
  disconnectedChannels.forEach((channel) => {
    rows.push({
      id: `channel-${channel.id}`,
      critical: false,
      icon: AlertTriangle,
      title: t("connection.channelDisconnectedTitle", { name: channel.name }),
      description: t("connection.channelDisconnectedBody"),
    });
  });
  disconnectedDevices.forEach((device) => {
    rows.push({
      id: `device-${device.id}`,
      critical: false,
      icon: AlertTriangle,
      title: t("connection.deviceDisconnectedTitle", { name: device.name }),
      description: t("connection.deviceDisconnectedBody"),
    });
  });

  const visible = rows.filter((row) => row.critical || !dismissed.has(row.id));
  if (visible.length === 0) return null;

  return (
    <div className="space-y-2 px-4 pt-3 md:px-6">
      {visible.map((row) => (
        <div
          key={row.id}
          role="alert"
          className={cn(
            "flex items-start gap-3 rounded-lg border px-3 py-2 text-sm",
            row.critical ? "border-danger/40 bg-danger-muted text-danger" : "border-warning/40 bg-warning-muted text-warning",
          )}
        >
          <row.icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="font-medium">{row.title}</p>
            <p className="text-xs opacity-90">{row.description}</p>
          </div>
          {row.critical ? null : (
            <button
              type="button"
              aria-label={t("common.dismiss")}
              className="shrink-0 opacity-70 hover:opacity-100"
              onClick={() => setDismissed((prev) => new Set(prev).add(row.id))}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
