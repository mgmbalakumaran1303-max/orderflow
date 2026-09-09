import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { ConnectionBanner } from "./ConnectionBanner";
import { useUiStore } from "@/stores/uiStore";
import { useOrderStore } from "@/stores/orderStore";
import { useRestaurantStore } from "@/stores/restaurantStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { cn } from "@/utils/format";
import { startOrderSimulator } from "@/services/realtime/orderSimulator";
import { playNewOrderChime, unlockSound } from "@/utils/sound";

export function AppShell() {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);
  const toast = useUiStore((s) => s.toast);
  const selectedId = useRestaurantStore((s) => s.selectedId);
  const loadRestaurants = useRestaurantStore((s) => s.load);
  const loadOrders = useOrderStore((s) => s.load);
  const addOrder = useOrderStore((s) => s.addOrder);
  const soundEnabled = useSettingsStore((s) => s.notifications.sound);
  const { t } = useTranslation();

  useEffect(() => {
    void loadRestaurants();
  }, [loadRestaurants]);

  useEffect(() => {
    if (selectedId) void loadOrders(selectedId);
  }, [selectedId, loadOrders]);

  // Autoplay policies require a user gesture before audio can play; unlock on first interaction.
  useEffect(() => {
    const unlock = () => unlockSound();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  // Mock realtime order feed — swap for a WebSocket/SSE subscription later.
  useEffect(() => {
    if (!selectedId) return undefined;
    const stop = startOrderSimulator(selectedId, (order) => {
      addOrder(order);
      toast("info", t("orders.newOrderToast", { number: order.number }));
      if (soundEnabled) playNewOrderChime();
    });
    return stop;
  }, [selectedId, addOrder, toast, soundEnabled, t]);

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <div className="sticky top-0 h-screen">
          <Sidebar />
        </div>
      </div>
      <div className={cn("fixed inset-0 z-30 lg:hidden", sidebarOpen ? "block" : "hidden")}>
        <button type="button" className="absolute inset-0 bg-black/50" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />
        <div className="relative h-full w-[248px]">
          <Sidebar forceExpanded />
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <ConnectionBanner />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
