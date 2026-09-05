import { db } from "@/data/db";
import { sleep } from "@/utils/format";
import type { CapacityState, Channel } from "@/types";

export const channelRepository = {
  async list(): Promise<Channel[]> {
    await sleep(160);
    return structuredClone(db.channels);
  },
  async save(channel: Channel): Promise<Channel> {
    await sleep(180);
    const index = db.channels.findIndex((row) => row.id === channel.id);
    if (index >= 0) db.channels[index] = channel;
    return structuredClone(channel);
  },
  async disconnect(id: Channel["id"]): Promise<Channel> {
    await sleep(180);
    const channel = db.channels.find((row) => row.id === id);
    if (!channel) throw new Error("Channel not found");
    channel.connected = false;
    channel.enabled = false;
    channel.apiStatus = "offline";
    return structuredClone(channel);
  },
};

export const capacityRepository = {
  async get(restaurantId: string): Promise<CapacityState> {
    await sleep(140);
    const found = db.capacity.find((row) => row.restaurantId === restaurantId);
    if (found) return structuredClone(found);
    const created = { restaurantId, maxPerHour: 20, autoCapacity: false };
    db.capacity.push(created);
    return structuredClone(created);
  },
  async save(state: CapacityState): Promise<CapacityState> {
    await sleep(160);
    const index = db.capacity.findIndex((row) => row.restaurantId === state.restaurantId);
    if (index >= 0) db.capacity[index] = state;
    else db.capacity.push(state);
    return structuredClone(state);
  },
};
