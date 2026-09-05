import { lazy, Suspense } from "react";
import { Navigate, createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { TableSkeleton } from "@/components/ui/Skeleton";

const DashboardPage = lazy(() => import("@/features/dashboard/pages/DashboardPage").then((m) => ({ default: m.DashboardPage })));
const OrdersPage = lazy(() => import("@/features/orders/pages/OrdersPage").then((m) => ({ default: m.OrdersPage })));
const OrderRoutePage = lazy(() => import("@/features/orders/pages/OrderRoutePage").then((m) => ({ default: m.OrderRoutePage })));
const MenuPage = lazy(() => import("@/features/menu/pages/MenuPage").then((m) => ({ default: m.MenuPage })));
const RestaurantPage = lazy(() => import("@/features/restaurant/pages/RestaurantPage").then((m) => ({ default: m.RestaurantPage })));
const DeliveryZonesPage = lazy(() => import("@/features/delivery-zones/pages/DeliveryZonesPage").then((m) => ({ default: m.DeliveryZonesPage })));
const CapacityPage = lazy(() => import("@/features/capacity/pages/CapacityPage").then((m) => ({ default: m.CapacityPage })));
const ChannelsPage = lazy(() => import("@/features/channels/pages/ChannelsPage").then((m) => ({ default: m.ChannelsPage })));
const UsersPage = lazy(() => import("@/features/users/pages/UsersPage").then((m) => ({ default: m.UsersPage })));
const DevicesPage = lazy(() => import("@/features/devices/pages/DevicesPage").then((m) => ({ default: m.DevicesPage })));
const ReportsPage = lazy(() => import("@/features/reports/pages/ReportsPage").then((m) => ({ default: m.ReportsPage })));
const SettingsPage = lazy(() => import("@/features/settings/pages/SettingsPage").then((m) => ({ default: m.SettingsPage })));

function Fallback() {
  return (
    <div className="p-6">
      <TableSkeleton />
    </div>
  );
}

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/", element: <Navigate to="/dashboard" replace /> },
          { path: "/dashboard", element: <Suspense fallback={<Fallback />}><DashboardPage /></Suspense> },
          { path: "/orders", element: <Suspense fallback={<Fallback />}><OrdersPage /></Suspense> },
          { path: "/orders/:orderId", element: <Suspense fallback={<Fallback />}><OrderRoutePage /></Suspense> },
          { path: "/menu", element: <Suspense fallback={<Fallback />}><MenuPage /></Suspense> },
          { path: "/restaurant", element: <Suspense fallback={<Fallback />}><RestaurantPage /></Suspense> },
          { path: "/delivery-zones", element: <Suspense fallback={<Fallback />}><DeliveryZonesPage /></Suspense> },
          { path: "/capacity", element: <Suspense fallback={<Fallback />}><CapacityPage /></Suspense> },
          { path: "/channels", element: <Suspense fallback={<Fallback />}><ChannelsPage /></Suspense> },
          { path: "/users", element: <Suspense fallback={<Fallback />}><UsersPage /></Suspense> },
          { path: "/devices", element: <Suspense fallback={<Fallback />}><DevicesPage /></Suspense> },
          { path: "/reports", element: <Suspense fallback={<Fallback />}><ReportsPage /></Suspense> },
          { path: "/settings", element: <Suspense fallback={<Fallback />}><SettingsPage /></Suspense> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/dashboard" replace /> },
]);
