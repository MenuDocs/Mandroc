/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { adminCommand, Color, MandrocCommand } from "@lib";

import type { Message } from "discord.js";
import { MessageEmbed } from "discord.js";

@adminCommand("watch", {
  aliases: ["watch"],
  editable: false,
  args: [
    {
      id: "regex",
      type: "string",
      prompt: {
        start: "Please provide a regex to blacklist.",
        retry: "I need a regex to blacklist.",
      },
    },
  ],
})
export default class WatchCommand extends MandrocCommand {
  async exec(message: Message, { regex }: args) {
    const embed = new MessageEmbed()
      .setColor(Color.PRIMARY);

    if (regex === "list") {
      const list = await this.client.redis.client.lrange("config.blacklisted-words", 0, -1) ?? [];

      if (!list.length) {
        embed
          .setDescription("No saved blacklisted words");

        return message.util?.send(embed);
      }

      embed
        .setDescription(list.map(x => `\`${x}\``).join(", "));

      message.util?.send(embed);
    } else {
      await this.client.redis.client.lpush("config.blacklisted-words", regex)

      embed
        .setDescription(`Added \`${regex}\` to the blacklist!`);

      message.util?.send(embed);
    }
  }
}

type args = {
  regex: string;
};
