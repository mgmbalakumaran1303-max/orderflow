import type {
  AppNotification,
  CapacityState,
  Channel,
  Customer,
  DeliveryZone,
  Device,
  MenuCategory,
  MenuItem,
  Order,
  OrderItem,
  OrderSource,
  OrderStatus,
  Restaurant,
  StaffUser,
  TimelineEvent,
} from "@/types";

export const restaurants: Restaurant[] = [
  {
    id: "rest-1",
    name: "My Restaurant",
    address: "Unter den Linden 10",
    city: "10117 Berlin, Germany",
    phone: "+49 30 1234 5678",
    email: "hello@myrestaurant.com",
    currency: "EUR",
    timezone: "Europe/Berlin",
    taxRate: 19,
    openingHours: "11:00 – 23:00",
  },
  {
    id: "rest-2",
    name: "Downtown Restaurant",
    address: "Friedrichstraße 88",
    city: "10117 Berlin, Germany",
    phone: "+49 30 2222 1111",
    email: "downtown@restaurant.com",
    currency: "EUR",
    timezone: "Europe/Berlin",
    taxRate: 19,
    openingHours: "10:00 – 22:00",
  },
  {
    id: "rest-3",
    name: "Airport Restaurant",
    address: "Terminal 1, Berlin Brandenburg",
    city: "12529 Schönefeld, Germany",
    phone: "+49 30 9999 0000",
    email: "airport@restaurant.com",
    currency: "EUR",
    timezone: "Europe/Berlin",
    taxRate: 19,
    openingHours: "06:00 – 22:00",
  },
];

export const customers: Customer[] = [
  { id: "c1", name: "John Doe", phone: "+49 123 456 7890", email: "john@example.com" },
  { id: "c2", name: "Anna Schmidt", phone: "+49 171 222 3344", email: "anna@example.com" },
  { id: "c3", name: "Lukas Weber", phone: "+49 176 555 8899", email: "lukas@example.com" },
  { id: "c4", name: "Sofia Rossi", phone: "+49 160 111 2233", email: "sofia@example.com" },
  { id: "c5", name: "Noah Müller", phone: "+49 152 444 7788", email: "noah@example.com" },
  { id: "c6", name: "Emma Braun", phone: "+49 174 333 2211", email: "emma@example.com" },
  { id: "c7", name: "Omar Haddad", phone: "+49 157 888 9900", email: "omar@example.com" },
  { id: "c8", name: "Mia Hoffmann", phone: "+49 162 101 2020", email: "mia@example.com" },
];

export const menuCategories: MenuCategory[] = [
  { id: "cat-pizza", name: "Pizza" },
  { id: "cat-pasta", name: "Pasta" },
  { id: "cat-drinks", name: "Drinks" },
  { id: "cat-desserts", name: "Desserts" },
  { id: "cat-salads", name: "Salads" },
];

export const menuItems: MenuItem[] = [
  {
    id: "mi-1",
    categoryId: "cat-pizza",
    name: "Margherita Pizza",
    description: "Tomato, mozzarella, basil, extra virgin olive oil.",
    price: 12,
    available: true,
    variants: [
      { id: "v1", name: "Small", price: 10 },
      { id: "v2", name: "Large", price: 14 },
    ],
    addons: [{ id: "a1", name: "Extra Cheese", price: 1.5 }],
  },
  {
    id: "mi-2",
    categoryId: "cat-pizza",
    name: "Pepperoni Pizza",
    description: "Spicy pepperoni with mozzarella and tomato sauce.",
    price: 14.5,
    available: true,
    variants: [],
    addons: [{ id: "a2", name: "Chili Flakes", price: 0.5 }],
  },
  {
    id: "mi-3",
    categoryId: "cat-pizza",
    name: "Veggie Pizza",
    description: "Peppers, mushrooms, olives, onions, and mozzarella.",
    price: 13.5,
    available: true,
    variants: [],
    addons: [],
  },
  {
    id: "mi-4",
    categoryId: "cat-pizza",
    name: "BBQ Chicken Pizza",
    description: "BBQ sauce, grilled chicken, red onion, mozzarella.",
    price: 15,
    available: true,
    variants: [],
    addons: [],
  },
  {
    id: "mi-5",
    categoryId: "cat-pizza",
    name: "Hawaiian Pizza",
    description: "Ham, pineapple, mozzarella, tomato sauce.",
    price: 13,
    available: false,
    variants: [],
    addons: [],
  },
  {
    id: "mi-6",
    categoryId: "cat-pasta",
    name: "Spaghetti Carbonara",
    description: "Pancetta, egg, pecorino, black pepper.",
    price: 13.5,
    available: true,
    variants: [],
    addons: [],
  },
  {
    id: "mi-7",
    categoryId: "cat-pasta",
    name: "Penne Arrabbiata",
    description: "Spicy tomato sauce with garlic and parsley.",
    price: 11.5,
    available: true,
    variants: [],
    addons: [],
  },
  {
    id: "mi-8",
    categoryId: "cat-drinks",
    name: "Coke",
    description: "330ml chilled Coca-Cola.",
    price: 3,
    available: true,
    variants: [],
    addons: [],
  },
  {
    id: "mi-9",
    categoryId: "cat-drinks",
    name: "Sparkling Water",
    description: "500ml San Pellegrino.",
    price: 2.5,
    available: true,
    variants: [],
    addons: [],
  },
  {
    id: "mi-10",
    categoryId: "cat-desserts",
    name: "Tiramisu",
    description: "Classic mascarpone dessert with espresso.",
    price: 6.5,
    available: true,
    variants: [],
    addons: [],
  },
  {
    id: "mi-11",
    categoryId: "cat-salads",
    name: "Caesar Salad",
    description: "Romaine, parmesan, croutons, Caesar dressing.",
    price: 9.5,
    available: true,
    variants: [],
    addons: [],
  },
  {
    id: "mi-12",
    categoryId: "cat-pizza",
    name: "Garlic Bread",
    description: "Oven-baked bread with garlic butter and herbs.",
    price: 4,
    available: true,
    variants: [],
    addons: [],
  },
];

const sources: OrderSource[] = ["uber-eats", "wolt", "whatsapp", "website", "other"];
const catalog: Array<{ name: string; price: number; notes?: string }> = [
  { name: "Margherita Pizza", price: 12, notes: "Extra Cheese" },
  { name: "Pepperoni Pizza", price: 14.5 },
  { name: "Coke", price: 3 },
  { name: "Garlic Bread", price: 4 },
  { name: "Spaghetti Carbonara", price: 13.5 },
  { name: "Tiramisu", price: 6.5 },
  { name: "Caesar Salad", price: 9.5 },
  { name: "BBQ Chicken Pizza", price: 15 },
];

function minutesAgo(mins: number): string {
  return new Date(Date.now() - mins * 60_000).toISOString();
}

function buildTimeline(status: OrderStatus, createdAt: string): TimelineEvent[] {
  const accepted = status !== "new" && status !== "cancelled" ? createdAt : status === "cancelled" ? createdAt : null;
  const preparing = ["preparing", "ready", "completed"].includes(status) ? createdAt : null;
  const ready = ["ready", "completed"].includes(status) ? createdAt : null;
  const completed = status === "completed" ? createdAt : null;
  const cancelled = status === "cancelled" ? createdAt : null;
  const events: TimelineEvent[] = [
    { status: "new", label: "New Order", at: createdAt },
    { status: "accepted", label: "Accepted", at: accepted },
    { status: "preparing", label: "Preparing", at: preparing },
    { status: "ready", label: "Ready", at: ready },
    { status: "completed", label: "Completed", at: completed },
  ];
  if (cancelled) {
    events.push({ status: "cancelled", label: "Cancelled", at: cancelled });
  }
  return events;
}

function makeItems(seed: number): OrderItem[] {
  const count = (seed % 3) + 1;
  return Array.from({ length: count }, (_, i) => {
    const item = catalog[(seed + i) % catalog.length];
    return {
      id: `oi-${seed}-${i}`,
      name: item.name,
      quantity: 1,
      price: item.price,
      notes: i === 0 ? item.notes : undefined,
    };
  });
}

const statusCycle: OrderStatus[] = [
  "new",
  "new",
  "preparing",
  "preparing",
  "ready",
  "completed",
  "completed",
  "completed",
  "cancelled",
  "completed",
];

function buildOrders(): Order[] {
  const orders: Order[] = [];
  for (let i = 0; i < 36; i += 1) {
    const restaurantId = i % 9 === 0 ? "rest-2" : i % 11 === 0 ? "rest-3" : "rest-1";
    const status = statusCycle[i % statusCycle.length];
    const createdAt = minutesAgo(2 + i * 7);
    const items = makeItems(i + 3);
    const customer = customers[i % customers.length];
    orders.push({
      id: `ord-${1024 + i}`,
      number: 1024 + i,
      restaurantId,
      source: sources[i % sources.length],
      customer,
      items,
      total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status,
      createdAt,
      timeline: buildTimeline(status, createdAt),
    });
  }
  return orders;
}

export const seedOrders = buildOrders();

export const deliveryZones: DeliveryZone[] = [
  { id: "z1", restaurantId: "rest-1", postcode: "10115", minOrder: 15, deliveryFee: 2.5, freeOver: 45, active: true },
  { id: "z2", restaurantId: "rest-1", postcode: "10117", minOrder: 18, deliveryFee: 3, freeOver: 50, active: true },
  { id: "z3", restaurantId: "rest-1", postcode: "10119", minOrder: 20, deliveryFee: 3.5, freeOver: 55, active: false },
  { id: "z4", restaurantId: "rest-1", postcode: "10435", minOrder: 16, deliveryFee: 2.8, freeOver: 48, active: true },
  { id: "z5", restaurantId: "rest-2", postcode: "10785", minOrder: 15, deliveryFee: 2.9, freeOver: 40, active: true },
  { id: "z6", restaurantId: "rest-3", postcode: "12529", minOrder: 12, deliveryFee: 1.5, freeOver: 30, active: true },
];

export const staffUsers: StaffUser[] = [
  { id: "u1", name: "Restaurant Admin", email: "admin@restaurant.com", role: "admin", status: "active", lastActive: minutesAgo(1) },
  { id: "u2", name: "Clara Manager", email: "clara@restaurant.com", role: "manager", status: "active", lastActive: minutesAgo(18) },
  { id: "u3", name: "Ben Staff", email: "ben@restaurant.com", role: "staff", status: "active", lastActive: minutesAgo(40) },
  { id: "u4", name: "Lena Viewer", email: "lena@restaurant.com", role: "viewer", status: "inactive", lastActive: minutesAgo(1400) },
];

export const devices: Device[] = [
  { id: "d1", name: "Orderpad-01", deviceId: "OP-01-8841", restaurantId: "rest-1", restaurantName: "My Restaurant", status: "connected", lastSeen: minutesAgo(2), version: "1.0.0", printer: "Kitchen-Epson-01" },
  { id: "d2", name: "Orderpad-02", deviceId: "OP-02-2290", restaurantId: "rest-1", restaurantName: "My Restaurant", status: "connected", lastSeen: minutesAgo(12), version: "1.0.0", printer: "Counter-Star-02" },
  { id: "d3", name: "KDS-Front", deviceId: "KDS-11-4402", restaurantId: "rest-2", restaurantName: "Downtown Restaurant", status: "disconnected", lastSeen: minutesAgo(180), version: "0.9.8", printer: "None" },
];

export const channels: Channel[] = [
  { id: "uber-eats", name: "Uber Eats", connected: true, enabled: true, lastSync: minutesAgo(3), autoAccept: false, autoPrint: true, apiStatus: "healthy" },
  { id: "whatsapp", name: "WhatsApp", connected: true, enabled: true, lastSync: minutesAgo(8), autoAccept: true, autoPrint: false, apiStatus: "healthy" },
  { id: "website", name: "Website", connected: true, enabled: true, lastSync: minutesAgo(1), autoAccept: false, autoPrint: true, apiStatus: "healthy" },
  { id: "wolt", name: "Wolt", connected: true, enabled: false, lastSync: minutesAgo(40), autoAccept: false, autoPrint: false, apiStatus: "degraded" },
];

export const notifications: AppNotification[] = [
  { id: "n1", title: "New Order #1028", body: "A new Uber Eats order is waiting.", createdAt: minutesAgo(2), read: false, href: "/orders?orderId=1028" },
  { id: "n2", title: "Order #1024 is ready", body: "Mark as completed when the courier arrives.", createdAt: minutesAgo(12), read: false, href: "/orders?orderId=1024" },
  { id: "n3", title: "Printer disconnected", body: "Kitchen-Epson-01 is offline.", createdAt: minutesAgo(30), read: true, href: "/devices" },
  { id: "n4", title: "Capacity is almost full", body: "14 of 20 orders this hour.", createdAt: minutesAgo(50), read: true, href: "/capacity" },
];

export const capacityByRestaurant: CapacityState[] = [
  { restaurantId: "rest-1", maxPerHour: 20, autoCapacity: true },
  { restaurantId: "rest-2", maxPerHour: 16, autoCapacity: false },
  { restaurantId: "rest-3", maxPerHour: 24, autoCapacity: true },
];
