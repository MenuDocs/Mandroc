import { adminCommand, Embed, MandrocCommand } from "@lib";
import { Argument } from "discord-akairo";
import { AntiMassModeration } from "../../../lib/administrative/automation/modules/AntiMassModeration";

import type { Message, TextChannel, User } from "discord.js";

@adminCommand("purge", {
  aliases: ["purge", "clear", "prune"],
  editable: false,
  args: [
    {
      id: "amount",
      type: Argument.range("number", 2, 100),
      prompt: {
        start: "Please provide an amount of messages to delete.",
        retry: "I need an amount of messages to delete."
      }
    },
    {
      id: "user",
      type: "user"
    },
    {
      id: "filter",
      type: [
        ["invites", "i"],
        ["embeds", "e"],
        ["bots", "b"],
        ["links", "l"]
      ],
      match: "option",
      flag: ["-f", "--filter"]
    },
    {
      id: "includePins",
      match: "flag",
      flag: ["-ip", "--include-pins"]
    },
    {
      id: "silent",
      match: "flag",
      flag: ["-s", "--silent"]
    }
  ]
})
export default class PurgeCommand extends MandrocCommand {
  public async exec(message: Message, args: args) {
    if (message.deletable) {
      await message.delete();
    } else {
      args.amount++;
    }

    if (args.user) {
      let messages = (
        await message.channel.messages.fetch({ limit: args.amount }, false)
      ).filter(m => m.author.id === args.user.id);

      await this._deleteMessages(
        message.channel as TextChannel,
        messages.keyArray()
      );

      message.util
        ?.send(
          Embed.Primary(
            `Deleted **${messages.size} messages** by ${args.user} \`(${args.user.id})\`.`
          )
        )
        ?.then(m => m.delete({ timeout: 5000 }));
    } else {
      let messages = await message.channel.messages.fetch(
        { limit: args.amount },
        false
      );
      if (args.filter) {
        switch (args.filter) {
          case "bots":
            messages = messages.filter(m => m.author.bot);
            break;
          case "embeds":
            messages = messages.filter(m => m.embeds.length > 0);
            break;
          case "invites":
            break;
        }
      }

      await this._deleteMessages(message.channel as TextChannel, [
        ...messages.keys()
      ]);

      message.util
        ?.send(Embed.Primary(`Deleted **${messages.size}**`))
        ?.then(m => m.delete({ timeout: 5000 }));
    }

    AntiMassModeration.incrementCommandUsage(message);
  }

  private async _deleteMessages(
    channel: TextChannel,
    messages: string[]
  ): Promise<any> {
    if (messages.length > 100) {
      return channel
        .bulkDelete(messages.splice(0, 100), true)
        .then(() => this._deleteMessages(channel, messages));
    }

    await channel.bulkDelete(messages, true);
  }
}

type args = {
  amount: number;
  user: User;
  filter: "invites" | "bots" | "embeds" | "links";
  silent: boolean;
  includePins: boolean;
};
