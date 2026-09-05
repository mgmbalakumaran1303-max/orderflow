import {
  capacityByRestaurant,
  channels,
  deliveryZones,
  devices,
  menuCategories,
  menuItems,
  notifications,
  restaurants,
  seedOrders,
  staffUsers,
} from "@/data/mocks/seed";
import type {
  AppNotification,
  CapacityState,
  Channel,
  DeliveryZone,
  Device,
  MenuCategory,
  MenuItem,
  Order,
  Restaurant,
  StaffUser,
} from "@/types";

function clone<T>(value: T): T {
  return structuredClone(value);
}

export const db = {
  restaurants: clone(restaurants),
  orders: clone(seedOrders),
  menuCategories: clone(menuCategories),
  menuItems: clone(menuItems),
  deliveryZones: clone(deliveryZones),
  users: clone(staffUsers),
  devices: clone(devices),
  channels: clone(channels),
  notifications: clone(notifications),
  capacity: clone(capacityByRestaurant),
};

export type DbSnapshot = {
  restaurants: Restaurant[];
  orders: Order[];
  menuCategories: MenuCategory[];
  menuItems: MenuItem[];
  deliveryZones: DeliveryZone[];
  users: StaffUser[];
  devices: Device[];
  channels: Channel[];
  notifications: AppNotification[];
  capacity: CapacityState[];
};
