/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { adminCommand, Color, MandrocCommand } from "@lib";

import type { Message } from "discord.js";
import { MessageEmbed } from "discord.js";

@adminCommand("unwatch", {
  aliases: ["unwatch"],
  editable: false,
  args: [
    {
      id: "regex",
      type: "string",
      prompt: {
        start: "Please provide a regex to un-blacklist.",
        retry: "I need a regex to un-blacklist.",
      },
    },
  ],
})
export default class UnWatchCommand extends MandrocCommand {
  async exec(message: Message, { regex }: args) {
    const embed = new MessageEmbed()
      .setColor(Color.PRIMARY);

    await this.client.redis.client.lrem("config.blacklisted-words", 0, regex);

    embed
      .setDescription(`Un-blacklisted \`${regex}\` if it existed`);

    message.util?.send(embed);
  }
}

type args = {
  regex: string;
};
