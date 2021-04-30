import { Database } from "../../database/Database";

import type { Mandroc, ScheduledTask } from "@lib";

export class BoostersTask implements ScheduledTask<BoostersMeta> {
  name = "boosters";

  async execute(_: Mandroc, {
    booster,
    userId
  }: BoostersMeta) {
    await Database.PRISMA.profile.upsert({
      where: { id: userId },
      create: { id: userId },
      update: { boosters: { [booster]: null } }
    });
  }
}

export interface BoostersMeta {
  booster: "coin" | "xp";
  userId: string;
}
