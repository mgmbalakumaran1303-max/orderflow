import { useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Bell,
  Gauge,
  LayoutDashboard,
  LogOut,
  MapPin,
  Palette,
  Radio,
  Settings,
  ShoppingBag,
  Store,
  Tablet,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/authStore";
import { useOrderStore } from "@/stores/orderStore";
import { useRestaurantStore } from "@/stores/restaurantStore";
import { useUiStore } from "@/stores/uiStore";
import { cn } from "@/utils/format";
import { IconButton } from "@/components/ui/IconButton";

export function Sidebar() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const selectedId = useRestaurantStore((s) => s.selectedId);
  const orders = useOrderStore((s) => s.orders);
  const counts = useMemo(
    () => ({
      new: orders.filter((order) => order.restaurantId === selectedId && order.status === "new").length,
      preparing: orders.filter((order) => order.restaurantId === selectedId && order.status === "preparing").length,
      ready: orders.filter((order) => order.restaurantId === selectedId && order.status === "ready").length,
    }),
    [orders, selectedId],
  );
  const close = useUiStore((s) => s.setSidebarOpen);
  const openConfirm = useUiStore((s) => s.openConfirm);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { to: "/dashboard", label: t("navigation.dashboard"), icon: LayoutDashboard },
    { to: "/orders", label: t("navigation.orders"), icon: ShoppingBag, badge: counts.new },
    { to: "/preparing", label: t("navigation.preparing"), icon: ShoppingBag, badge: counts.preparing },
    { to: "/ready", label: t("navigation.ready"), icon: ShoppingBag, badge: counts.ready },
    { to: "/menu", label: t("navigation.menu"), icon: UtensilsCrossed },
    { to: "/restaurant", label: t("navigation.restaurant"), icon: Store },
    { to: "/delivery-zones", label: t("navigation.deliveryZones"), icon: MapPin },
    { to: "/capacity", label: t("navigation.capacity"), icon: Gauge },
    { to: "/channels", label: t("navigation.channels"), icon: Radio },
    { to: "/users", label: t("navigation.users"), icon: Users },
    { to: "/devices", label: t("navigation.devices"), icon: Tablet },
    { to: "/reports", label: t("navigation.reports"), icon: BarChart3 },
    { to: "/notifications", label: t("navigation.notifications"), icon: Bell },
    { to: "/settings", label: t("navigation.settings"), icon: Settings },
    { to: "/settings/personalization", label: t("navigation.personalization"), icon: Palette },
  ];

  return (
    <aside className="flex h-full w-[248px] flex-col border-r border-border bg-surface">
      <div className="flex items-center justify-between px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">OF</div>
          <div>
            <p className="text-sm font-semibold tracking-[0.18em]">ORDERFLOW</p>
            <p className="text-[11px] text-muted">{t("navigation.subtitle")}</p>
          </div>
        </div>
        <IconButton label={t("common.close")} className="lg:hidden" onClick={() => close(false)}>
          <X className="h-4 w-4" />
        </IconButton>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {items.map((item) => {
          const active =
            location.pathname === item.to ||
            (item.to !== "/orders" && item.to !== "/settings" && location.pathname.startsWith(`${item.to}/`));
          const Icon = item.icon;
          const badge = item.badge ?? 0;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => close(false)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                active ? "glow-primary bg-primary text-white" : "text-muted hover:bg-card-hover hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
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
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-muted text-xs font-semibold text-primary">
            RA
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user?.name ?? "Restaurant Admin"}</p>
            <p className="truncate text-xs text-muted">{user?.email ?? "admin@restaurant.com"}</p>
          </div>
        </div>
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-danger hover:bg-card-hover"
          onClick={() => {
            openConfirm({
              title: t("dialogs.logoutTitle"),
              description: t("dialogs.logoutBody"),
              confirmLabel: t("auth.logout"),
              cancelLabel: t("common.cancel"),
              variant: "danger",
              onConfirm: () => {
                logout();
                navigate("/login");
              },
            });
          }}
        >
          <LogOut className="h-4 w-4" />
          {t("navigation.logout")}
        </button>
      </div>
    </aside>
  );
}
