import { db } from "@/data/db";
import { sleep } from "@/utils/format";
import type { DeliveryZone } from "@/types";

export const deliveryZoneRepository = {
  async list(restaurantId: string): Promise<DeliveryZone[]> {
    await sleep(180);
    return structuredClone(db.deliveryZones.filter((zone) => zone.restaurantId === restaurantId));
  },
  async save(zone: DeliveryZone): Promise<DeliveryZone> {
    await sleep(180);
    const index = db.deliveryZones.findIndex((row) => row.id === zone.id);
    if (index === -1) db.deliveryZones.push(zone);
    else db.deliveryZones[index] = zone;
    return structuredClone(zone);
  },
  async create(input: Omit<DeliveryZone, "id">): Promise<DeliveryZone> {
    await sleep(200);
    const created: DeliveryZone = { ...input, id: `z-${Date.now()}` };
    db.deliveryZones.push(created);
    return structuredClone(created);
  },
  async remove(id: string): Promise<void> {
    await sleep(160);
    db.deliveryZones = db.deliveryZones.filter((zone) => zone.id !== id);
  },
};
