import { useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Bell,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
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

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: number;
}

interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

export function Sidebar({ forceExpanded = false }: { forceExpanded?: boolean }) {
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
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ orders: true, operations: false, administration: false });
  // Desktop-only icon rail; the mobile overlay (forceExpanded) always shows the full sidebar.
  const collapsedPref = useUiStore((s) => s.sidebarCollapsed);
  const toggleCollapsed = useUiStore((s) => s.toggleSidebarCollapsed);
  const collapsed = !forceExpanded && collapsedPref;

  const primaryItems: NavItem[] = [
    { to: "/dashboard", label: t("navigation.dashboard"), icon: LayoutDashboard },
    { to: "/menu", label: t("navigation.menu"), icon: UtensilsCrossed },
    { to: "/channels", label: t("navigation.channels"), icon: Radio },
    { to: "/reports", label: t("navigation.analytics"), icon: BarChart3 },
  ];

  const groups: NavGroup[] = [
    {
      id: "orders",
      label: t("navigation.groupOrders"),
      items: [
        { to: "/new", label: t("navigation.new"), icon: ShoppingBag, badge: counts.new },
        { to: "/preparing", label: t("navigation.preparing"), icon: ShoppingBag, badge: counts.preparing },
        { to: "/ready", label: t("navigation.ready"), icon: ShoppingBag, badge: counts.ready },
        { to: "/completed", label: t("navigation.completed"), icon: ShoppingBag },
        { to: "/orders", label: t("navigation.allOrders"), icon: ShoppingBag },
      ],
    },
    {
      id: "operations",
      label: t("navigation.groupOperations"),
      items: [
        { to: "/restaurant", label: t("navigation.restaurant"), icon: Store },
        { to: "/delivery-zones", label: t("navigation.deliveryZones"), icon: MapPin },
        { to: "/capacity", label: t("navigation.capacity"), icon: Gauge },
        { to: "/devices", label: t("navigation.devices"), icon: Tablet },
        { to: "/notifications", label: t("navigation.notifications"), icon: Bell },
      ],
    },
    {
      id: "administration",
      label: t("navigation.groupAdministration"),
      items: [
        { to: "/users", label: t("navigation.users"), icon: Users },
        { to: "/settings", label: t("navigation.settings"), icon: Settings },
        { to: "/settings/personalization", label: t("navigation.personalization"), icon: Palette },
      ],
    },
  ];

  function isActive(to: string): boolean {
    if (location.pathname === to) return true;
    if (to === "/orders" || to === "/settings") return false;
    return location.pathname.startsWith(`${to}/`);
  }

  function renderItem(item: NavItem) {
    const active = isActive(item.to);
    const Icon = item.icon;
    const badge = item.badge ?? 0;

    if (collapsed) {
      return (
        <NavLink
          key={item.to}
          to={item.to}
          title={badge ? `${item.label} (${badge})` : item.label}
          aria-label={item.label}
          aria-current={active ? "page" : undefined}
          className={cn(
            "relative mx-auto flex h-10 w-10 items-center justify-center rounded-lg transition",
            active ? "glow-primary bg-primary text-white" : "text-muted hover:bg-card-hover hover:text-foreground",
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
          {badge ? (
            <span className={cn("absolute right-1 top-1 h-2 w-2 rounded-full", active ? "bg-white" : "bg-primary")} aria-hidden />
          ) : null}
        </NavLink>
      );
    }

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
          <span className={cn("rounded-full px-1.5 text-[11px]", active ? "bg-white/20" : "bg-primary text-white")}>{badge}</span>
        ) : null}
      </NavLink>
    );
  }

  return (
    <aside className={cn("flex h-full flex-col border-r border-border bg-surface transition-[width] duration-150", collapsed ? "w-[76px]" : "w-[248px]")}>
      <div className={cn("flex items-center px-5 py-5", collapsed ? "justify-center px-0" : "justify-between")}>
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">OF</div>
          {collapsed ? null : (
            <div>
              <p className="text-sm font-semibold tracking-[0.18em]">ORDERFLOW</p>
              <p className="text-[11px] text-muted">{t("navigation.subtitle")}</p>
            </div>
          )}
        </div>
        {collapsed ? null : (
          <IconButton label={t("common.close")} className="lg:hidden" onClick={() => close(false)}>
            <X className="h-4 w-4" />
          </IconButton>
        )}
      </div>

      {forceExpanded ? null : (
        <div className={cn("hidden px-3 lg:flex", collapsed ? "justify-center" : "justify-end")}>
          <IconButton
            label={collapsed ? t("common.expandSidebar") : t("common.collapseSidebar")}
            aria-expanded={!collapsed}
            onClick={toggleCollapsed}
          >
            {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          </IconButton>
        </div>
      )}

      <nav className={cn("flex-1 overflow-y-auto pb-3", collapsed ? "space-y-3 px-2 pt-2" : "space-y-4 px-3 pt-3")}>
        <div className={collapsed ? "space-y-2" : "space-y-0.5"}>{primaryItems.map(renderItem)}</div>
        {collapsed ? (
          groups.map((group) => (
            <div key={group.id} className="space-y-2 border-t border-border pt-3">
              {group.items.map(renderItem)}
            </div>
          ))
        ) : (
          groups.map((group) => {
            const expanded = openGroups[group.id];
            return (
              <div key={group.id}>
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setOpenGroups((prev) => ({ ...prev, [group.id]: !prev[group.id] }))}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-subtle hover:text-foreground"
                >
                  {group.label}
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expanded ? "rotate-0" : "-rotate-90")} aria-hidden />
                </button>
                {expanded ? <div className="mt-0.5 space-y-0.5">{group.items.map(renderItem)}</div> : null}
              </div>
            );
          })
        )}
      </nav>

      <div className={cn("border-t border-border", collapsed ? "flex flex-col items-center gap-2 py-4" : "p-4")}>
        {collapsed ? (
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-muted text-xs font-semibold text-primary"
            title={user?.name ?? "Restaurant Admin"}
          >
            RA
          </div>
        ) : (
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-muted text-xs font-semibold text-primary">
              RA
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user?.name ?? "Restaurant Admin"}</p>
              <p className="truncate text-xs text-muted">{user?.email ?? "admin@restaurant.com"}</p>
            </div>
          </div>
        )}
        <button
          type="button"
          title={collapsed ? t("navigation.logout") : undefined}
          aria-label={t("navigation.logout")}
          className={cn(
            "flex items-center gap-2 rounded-lg text-sm text-danger hover:bg-card-hover",
            collapsed ? "h-9 w-9 justify-center" : "w-full px-2 py-2",
          )}
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
          {collapsed ? null : t("navigation.logout")}
        </button>
      </div>
    </aside>
  );
}
