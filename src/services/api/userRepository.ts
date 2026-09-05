import { db } from "@/data/db";
import { sleep } from "@/utils/format";
import type { StaffUser } from "@/types";

export const userRepository = {
  async list(): Promise<StaffUser[]> {
    await sleep(180);
    return structuredClone(db.users);
  },
  async save(user: StaffUser): Promise<StaffUser> {
    await sleep(200);
    const index = db.users.findIndex((row) => row.id === user.id);
    if (index === -1) db.users.push(user);
    else db.users[index] = user;
    return structuredClone(user);
  },
  async create(input: Omit<StaffUser, "id" | "lastActive">): Promise<StaffUser> {
    await sleep(220);
    const created: StaffUser = {
      ...input,
      id: `u-${Date.now()}`,
      lastActive: new Date().toISOString(),
    };
    db.users.push(created);
    return structuredClone(created);
  },
  async remove(id: string): Promise<void> {
    await sleep(180);
    db.users = db.users.filter((user) => user.id !== id);
  },
};
