/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { adminCommand, Embed, MandrocCommand } from "@lib";
import { Argument } from "discord-akairo";

import type { Collection, Message, TextChannel, User } from "discord.js";
import { SnowflakeUtil } from "discord.js";
import ms from "ms";
import { AntiMassModeration } from "../../../lib/administrative/automation/modules/AntiMassModeration";

@adminCommand("purge", {
  aliases: ["purge", "clear", "prune"],
  editable: false,
  args: [
    {
      id: "amount",
      type: Argument.range("number", 2, 1000),
      prompt: {
        start: "Please provide an amount of messages to delete.",
        retry: "I need an amount of messages to delete.",
      },
    },
    {
      id: "user",
      type: "user",
    },
    {
      id: "filter",
      type: [
        ["invites", "i"],
        ["embeds", "e"],
        ["bots", "b"],
        ["links", "l"],
      ],
      match: "option",
      flag: ["-f", "--filter"],
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
    if (args.user) {
      let messages = (
        await message.channel.messages.fetch(
          { limit: args.amount > 100 ? 2000 : 500 },
          false
        )
      )
        .filter(
          (m) =>
            m.author.id === args.user.id &&
            SnowflakeUtil.deconstruct(m.id).timestamp >= Date.now() + ms("2w")
        )
        .array()
        .slice(0, args.amount);

      await this._deleteMessages(
        message.channel as TextChannel,
        messages.map((m) => m.id)
      );
      return Embed.Primary(
        `Deleted **${messages.length}** by ${args.user} \`(${args.user.id})\`.`
      );
    }

    let messages = await message.channel.messages.fetch({ limit: 100 }, false);
    if (args.filter) {
      switch (args.filter) {
        case "bots":
          messages = messages.filter((m) => m.author.bot);
          break;
        case "embeds":
          messages = messages.filter((m) => m.embeds.length > 0);
          break;
        case "invites":
          break;
      }
    }

    AntiMassModeration.incrementCommandUsage(message);
  }

  private _deleteMessages(
    channel: TextChannel,
    messages: string[]
  ): Promise<Collection<string, Message>> {
    if (messages.length > 100) {
      return channel
        .bulkDelete(messages.splice(0, 100))
        .then(() => this._deleteMessages(channel, messages));
    }

    return channel.bulkDelete(messages);
  }
}

type args = {
  amount: number;
  user: User;
  filter: "invites" | "bots" | "embeds" | "links";
  silent: boolean;
  includePins: boolean;
};
