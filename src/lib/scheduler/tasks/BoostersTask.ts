/*
 * Copyright (c) MenuDocs 2021.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { Mandroc, Profile, ScheduledTask } from "@lib";

export class BoostersTask implements ScheduledTask<data> {
  name = "boosters";

  async execute(_: Mandroc, {
    booster,
    userId,
  }: data) {
    const profile = await Profile.findOneOrCreate({
      where: { userId },
      create: { userId },
    });

    profile.boosters[booster] = 1;
    await profile.save();
  }
}

type data = {
  booster: "coin" | "xp";
  userId: string;
}
