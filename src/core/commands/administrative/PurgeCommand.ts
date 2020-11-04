/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { adminCommand, Color, MandrocCommand } from "@lib";
import type { Message } from "discord.js";
import { MessageEmbed } from "discord.js";

@adminCommand("purge", {
  aliases: ["purge", "clear", "prune"],
  editable: false,
  args: [
    {
      id: "amount",
      type: "number",
      prompt: {
        start: "Please provide an amount of messages to delete.",
        retry: "I need an amount of messages to delete.",
      },
    },
    {
      id: "includePins",
      match: "flag",
      flag: ["-ip", "--include-pins"],
    },
    {
      id: "silent",
      match: "flag",
      flag: ["-s", "--silent"],
    },
  ],
})
export default class PurgeCommand extends MandrocCommand {
  public async exec(message: Message, args: args) {
    if (message.deletable) {
      await message.delete();
    }

    if (args.amount > 100) {
      return message.util?.send(
        "You may not delete more than 100 messages at a time."
      );
    }

    const messages = (
      await message.channel.messages.fetch({ limit: args.amount })
    ).filter((m) => !m.deleted && m.deletable);

    messages.map((msg) => (args.includePins == msg.pinned ? msg.delete() : ""));

    let filtered =
      args.amount -
      messages.filter((msg) => msg.pinned == args.includePins).size;
    let returnMessage = `Successfully deleted **${messages.size}** messages.`;
    if (filtered > 0) returnMessage += `\nIgnore ${filtered} pinned messages.`;

    if (!args.silent) {
      message.util
        ?.send(
          new MessageEmbed()
            .setColor(Color.Primary)
            .setDescription(returnMessage)
        )
        .then((msg) => msg.delete({ timeout: 6e3 }));
    }
  }
}

type args = {
  amount: number;
  silent: boolean;
  includePins: boolean;
};
