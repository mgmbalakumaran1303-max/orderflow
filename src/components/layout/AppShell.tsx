import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useUiStore } from "@/stores/uiStore";
import { useOrderStore } from "@/stores/orderStore";
import { useRestaurantStore } from "@/stores/restaurantStore";
import { cn } from "@/utils/format";

export function AppShell() {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);
  const selectedId = useRestaurantStore((s) => s.selectedId);
  const loadRestaurants = useRestaurantStore((s) => s.load);
  const loadOrders = useOrderStore((s) => s.load);

  useEffect(() => {
    void loadRestaurants();
  }, [loadRestaurants]);

  useEffect(() => {
    if (selectedId) void loadOrders(selectedId);
  }, [selectedId, loadOrders]);

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
          <Sidebar />
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
