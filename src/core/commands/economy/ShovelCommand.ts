/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { command, Embed, Item, ItemTier, MandrocCommand } from "@lib";
import type { Message } from "discord.js";

@command("shovel", {
  aliases: [ "shovel" ],
  description: {
    content: "Shovels after goods in the ground.",
    examples: (prefix: string) => [ `${prefix}shovel` ],
    usage: "",
  },
})
export default class ShovelCommand extends MandrocCommand {
  private items: Array<Item> = [
    {
      name: "Lilly",
      price: 60,
      tier: "basic",
    },
    {
      name: "Dirt",
      price: 2,
      tier: "basic",
    },
    {
      name: "Dropped iPhone",
      price: 2000,
      tier: "exotic",
    },
  ];

  private itemTiers: ItemTier[] = [ "basic", "common", "rare", "exotic" ];
  private chances: number[][] = [
    [ 0, 40 ],
    [ 41, 71 ],
    [ 72, 94 ],
    [ 95, 100 ],
  ];

  public async exec(message: Message) {
    const profile = await message.member!.getProfile(),
      roll = Math.floor(Math.random() * 100),
      embed = Embed.Primary();

    if (!profile.inventory.find((x) => x.name == "Shovel")) {
      return message.util?.send(
        "You must possess a shovel in order to run this command.",
      );
    }

    profile.inventory.find((x) => x.name === "Shovel")!.durability -= 1;

    if (Math.floor(Math.random() * 100) <= 33) {
      await profile.save();
      return message.util?.send("You didn't find anything in the ground.");
    }

    let i = 0;

    for (const entry of this.chances) {
      const [ low, high ] = entry;

      if (roll <= low && roll >= high) {
        const grantedItem = this.items
          .filter((x) => x.tier === this.itemTiers[i])
          .random();
        profile.pocket += grantedItem.price;
        message.util?.send(
          embed.setDescription(
            `Wow, you digged up a ${grantedItem.name}, it's value of \`${grantedItem.price} ₪\` has been added to your pocket.`,
          ),
        );
      }
      i++;
    }

    await profile.save();
  }
}
