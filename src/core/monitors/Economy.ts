/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { BodyguardTier, IDs, monitor, Monitor, Tool, Tools } from "@lib";
import type { Message } from "discord.js";

@monitor("economy")
export class Economy extends Monitor {
  private readonly recently = new Set();

  private readonly lootBoxItems: Array<LootBoxDropItem> = [
    {
      name: "gold bag",
      value: 660,
      type: "item",
    },
    {
      name: "after shave set from your grandma",
      value: 35,
      type: "item",
    },
    {
      name: "gem ",
      value: Number.random(500, 5000),
      type: "gems",
    },
    {
      name: "bodyguard",
      type: "bodyguard",
      value: 0,
    },
  ];

  private readonly toolList: Array<Tool> = [
    {
      name: "Fishing Rod",
      durability: Number.random(50, 100),
    },
  ];

  async exec(message: Message) {
    if (message.partial) {
      await message.fetch();
    }

    if (
      !message.guild ||
      message.author.bot ||
      message.content.startsWith("!")
    ) {
      return;
    }

    const profile = await message.member?.getProfile()!;
    if (!this.recently.has(message.author.id) && Math.random() >= 0.5) {
      profile.pocket += Number.random(5, 50);

      if (Math.random() >= 0.6) {
        profile.xp += Number.random(2, 25);
        if (profile.xp > profile.level * 72 * 2) {
          profile.level++;
          await message.channel
            .send(
              `Congrats ${message.author} :tada: You progressed to **Level ${profile.level}**`
            )
            .then((m) => m.delete({ timeout: 6000 }));
          if (IDs.LEVELS[profile.level]) {
            message.member?.roles?.add(IDs.LEVELS[profile.level]);
          }

          if (Math.random() < 0.33) {
            const randomItem = this.lootBoxItems.random();

            switch (randomItem.type) {
              case "gems":
                profile.pocket += randomItem.value;
                message.channel
                  .send(
                    `${message.author}, you found a bag full of gems! Their value, of \`${randomItem.value} ₪, has been added to your pocket!\``
                  )
                  .then((m) => m.delete({ timeout: 6000 }));

                break;

              case "item":
                profile.pocket += randomItem.value;
                message.channel
                  .send(
                    `Amazing, you both leveled up and found a: \`${randomItem.name}\`, you sold it and got **${randomItem.value} ₪**`
                  )
                  .then((m) => m.delete({ timeout: 6000 }));

                break;

              case "tool":
                const tool = this.toolList.random();
                profile.inventory.push(tool);
                message.channel
                  .send(
                    `${message.author}, you bent down and found a really awesome \`${tool.name}\`.`
                  )
                  .then((m) => m.delete({ timeout: 6000 }));

                break;

              case "bodyguard":
                if (profile.bodyguard) {
                  message.channel
                    .send(
                      `${message.author}, you met a really nice guy who offered to be your bodyguard, you rejected though.`
                    )
                    .then((m) => m.delete({ timeout: 6000 }));
                } else {
                  const bodyguard = [
                    "deluxe",
                    "gold",
                    "rookie",
                  ].random() as BodyguardTier;
                  profile.bodyguard = bodyguard;
                  message.channel
                    .send(
                      `${message.author}, a bodyguard of the tier **${bodyguard}** offered to protect you, and you said *yes please!*`
                    )
                    .then((m) => m.delete({ timeout: 6000 }));
                }

                break;
            }
          }
        }
      }

      await profile.save();
      this.recently.add(message.author.id);
      this.client.setTimeout(
        () => this.recently.delete(message.author.id),
        6000
      );
    }
  }
}

interface LootBoxDropItem {
  name: string;
  value: number;
  type: "bodyguard" | "gems" | "tool" | "item";
  toolType?: Tools;
}
