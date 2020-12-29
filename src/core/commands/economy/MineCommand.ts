/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { Color, command, MandrocCommand, Item, ItemTier, Profile, Embed } from "@lib";
import { Message, MessageEmbed } from "discord.js";
import ms from "ms";

@command("mine", {
  aliases: ["mine"],
  description: {
    content: "Shovels after goods in the ground.",
    examples: (prefix: string) => [`${prefix}shovel`],
    usage: "",
  },
})
export default class MineCommand extends MandrocCommand {
  private items: Array<Item> = [
    { name: "Diamond", price: 400, tier: "exotic" },
    { name: "Emerald", price: 260, tier: "rare" },
    { name: "Sapphire", price: 288, tier: "rare"},
    { name: "Stone", price: 8, tier: "basic" },
    { name: "Cobblestone", price: 50, tier: "common" }
  ];

  private itemTiers: ItemTier[] = ["basic", "common", "rare", "exotic"];
  private chances: number[][] = [
    [0, 40],
    [41, 71],
    [72, 94],
    [95, 100],
  ];

  public async exec(message: Message) {
    const { author } = message;
    const profile =
      (await Profile.findOne({ _id: author.id })) ??
      (await Profile.create({ _id: author.id }));

    const roll = Math.floor(Math.random() * 100);

    const embed = new MessageEmbed().setColor(Color.PRIMARY);

    if (!profile.inventory.find((x) => x.name == "Pickaxe"))
      return message.util?.send(
        "You must possess a pickaxe in order to run this command."
      );

    if (profile.lastMined && profile.lastMined < Date.now() + ms("25m")) {
      return message.util?.send(Embed.Warning("You can only access this command every 25 minutes."));
    }

    profile.inventory.find((x) => x.name === "Pickaxe")!.durability -= 1;

    if (Math.floor(Math.random() * 100) <= 33) {
      await profile.save();
      return message.util?.send("You didn't find anything in the mine.");
    }

    let i = 0;

    for (const entry of this.chances) {
      const [low, high] = entry;

      if (roll <= low && roll >= high) {
        const grantedItem = this.items
          .filter((x) => x.tier === this.itemTiers[i])
          .random();
        profile.pocket += grantedItem.price;
        message.util?.send(
          embed.setDescription(
            `Wow, you mined a ${grantedItem.name}, it's value of \`${grantedItem.price} ₪\` has been added to your pocket.`
          )
        );
      }
      i++;
    }

    await profile.save();
  }
}
