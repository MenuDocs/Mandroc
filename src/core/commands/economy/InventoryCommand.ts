/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { Color, command, MandrocCommand } from "@lib";
import type { Message } from "discord.js";
import { MessageEmbed } from "discord.js";

@command("inventory", {
  aliases: ["inventory", "tools", "inv"],
  description: {
    content: "Displays your inventory.",
    examples: (prefix: string) => [`${prefix}inventory`],
    usage: "!inventory",
  },
})
export default class FishCommand extends MandrocCommand {
  public async exec(message: Message) {
    const profile = await message.member?.getProfile()!;
    if (!profile.inventory.length) {
      return message.util?.send("You do not possess any tools!");
    }

    const embed = new MessageEmbed()
      .setColor(Color.PRIMARY)
      .setTitle("Your tools")
      .setFooter(
        message.author.tag,
        message.author.displayAvatarURL({
          size: 2048,
          dynamic: true,
        })
      );

    let desc = "";

    for (const entry of profile.inventory) {
      desc += `${entry.name}\n\u3000 **Durability:** ${entry.durability}`;
    }

    embed.setDescription(desc);
    message.util?.send(embed);
  }
}
