import { db } from "@/data/db";
import { sleep } from "@/utils/format";
import type { Device } from "@/types";

export const deviceRepository = {
  async list(): Promise<Device[]> {
    await sleep(180);
    return structuredClone(db.devices);
  },
  async get(id: string): Promise<Device | null> {
    await sleep(140);
    const found = db.devices.find((device) => device.id === id);
    return found ? structuredClone(found) : null;
  },
  async save(device: Device): Promise<Device> {
    await sleep(180);
    const index = db.devices.findIndex((row) => row.id === device.id);
    if (index >= 0) db.devices[index] = device;
    return structuredClone(device);
  },
  async remove(id: string): Promise<void> {
    await sleep(180);
    db.devices = db.devices.filter((device) => device.id !== id);
  },
};
