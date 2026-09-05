import { useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  Gauge,
  LayoutDashboard,
  MapPin,
  Radio,
  Settings,
  ShoppingBag,
  Store,
  Tablet,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useOrderStore } from "@/stores/orderStore";
import { useRestaurantStore } from "@/stores/restaurantStore";
import { useUiStore } from "@/stores/uiStore";
import { cn } from "@/utils/format";
import { IconButton } from "@/components/ui/IconButton";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/orders", label: "Orders", icon: ShoppingBag, badgeKey: "new" as const },
  { to: "/menu", label: "Menu", icon: UtensilsCrossed },
  { to: "/restaurant", label: "Restaurant", icon: Store },
  { to: "/delivery-zones", label: "Delivery Zones", icon: MapPin },
  { to: "/capacity", label: "Capacity", icon: Gauge },
  { to: "/channels", label: "Channels", icon: Radio },
  { to: "/users", label: "Users", icon: Users },
  { to: "/devices", label: "Devices", icon: Tablet },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const selectedId = useRestaurantStore((s) => s.selectedId);
  const orders = useOrderStore((s) => s.orders);
  const counts = useMemo(
    () => ({
      new: orders.filter((order) => order.restaurantId === selectedId && order.status === "new").length,
    }),
    [orders, selectedId],
  );
  const close = useUiStore((s) => s.setSidebarOpen);
  const location = useLocation();

  return (
    <aside className="flex h-full w-[248px] flex-col border-r border-border bg-surface">
      <div className="flex items-center justify-between px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">OF</div>
          <div>
            <p className="text-sm font-semibold tracking-[0.18em]">ORDERFLOW</p>
            <p className="text-[11px] text-muted">Restaurant Admin Portal</p>
          </div>
        </div>
        <IconButton label="Close navigation" className="lg:hidden" onClick={() => close(false)}>
          <X className="h-4 w-4" />
        </IconButton>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {items.map((item) => {
          const active = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
          const Icon = item.icon;
          const badge = item.badgeKey ? counts.new : 0;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => close(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                active ? "glow-primary bg-primary text-white" : "text-muted hover:bg-card-hover hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1">{item.label}</span>
              {badge ? (
                <span className={cn("rounded-full px-1.5 text-[11px]", active ? "bg-white/20" : "bg-primary text-white")}>
                  {badge}
                </span>
              ) : null}
            </NavLink>
          );
        })}
      </nav>
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-muted text-xs font-semibold text-primary">
            RA
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user?.name ?? "Restaurant Admin"}</p>
            <p className="truncate text-xs text-muted">{user?.email ?? "admin@restaurant.com"}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
