export type OrderStatus = "new" | "preparing" | "ready" | "completed" | "cancelled";
export type OrderSource = "uber-eats" | "whatsapp" | "website" | "wolt" | "other";
export type UserRole = "admin" | "manager" | "staff" | "viewer";
export type UserStatus = "active" | "inactive";
export type DeviceStatus = "connected" | "disconnected";
export type ChannelId = "uber-eats" | "whatsapp" | "website" | "wolt";
export type ThemeMode = "dark" | "light";
export type ExportFormat = "csv" | "excel" | "pdf";

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  currency: string;
  timezone: string;
  taxRate: number;
  openingHours: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface TimelineEvent {
  status: OrderStatus | "accepted";
  label: string;
  at: string | null;
}

export interface Order {
  id: string;
  number: number;
  restaurantId: string;
  source: OrderSource;
  customer: Customer;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  timeline: TimelineEvent[];
  rejectReason?: string;
}

export interface MenuCategory {
  id: string;
  name: string;
}

export interface MenuVariant {
  id: string;
  name: string;
  price: number;
}

export interface MenuAddon {
  id: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
  variants: MenuVariant[];
  addons: MenuAddon[];
}

export interface DeliveryZone {
  id: string;
  restaurantId: string;
  postcode: string;
  minOrder: number;
  deliveryFee: number;
  freeOver: number;
  active: boolean;
}

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastActive: string;
}

export interface Device {
  id: string;
  name: string;
  deviceId: string;
  restaurantId: string;
  restaurantName: string;
  status: DeviceStatus;
  lastSeen: string;
  version: string;
  printer: string;
}

export interface Channel {
  id: ChannelId;
  name: string;
  connected: boolean;
  enabled: boolean;
  lastSync: string;
  autoAccept: boolean;
  autoPrint: boolean;
  apiStatus: "healthy" | "degraded" | "offline";
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  href: string;
}

export interface AuthUser {
  name: string;
  email: string;
  role: string;
}

export interface RestaurantSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  openingHours: string;
  currency: string;
  timezone: string;
  taxRate: number;
}

export interface CapacityState {
  restaurantId: string;
  maxPerHour: number;
  autoCapacity: boolean;
}

export interface AppSettings {
  theme: ThemeMode;
  notifications: {
    newOrder: boolean;
    sound: boolean;
    desktop: boolean;
    status: boolean;
    lowCapacity: boolean;
  };
  orders: {
    autoAccept: boolean;
    autoPrint: boolean;
    prepTimeMinutes: number;
    timeoutMinutes: number;
    allowCancellation: boolean;
  };
  printer: {
    name: string;
    connectionType: string;
    autoPrint: boolean;
    receiptFormat: string;
    available: boolean;
  };
}
