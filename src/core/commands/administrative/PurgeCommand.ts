import { adminCommand, MandrocCommand, Color } from "@lib";

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
export default class WarnCommand extends MandrocCommand {
  public async exec(message: Message, args: args) {
    await message.delete();

    let i = 0;
    (await message.channel.messages.fetch({ limit: args.amount })).map((msg) =>
      (msg.deletable && msg.pinned && args.includePins) ||
      (!msg.pinned && !args.includePins)
        ? msg.delete()
        : i++
    );
    let returnMessage = `Successfully deleted **${args.amount - i}** messages.`;
    if (i > 0)
      returnMessage += `\nDidn't delete ${i} messages, due to them being pinned`;

    if (!args.silent)
      message.util
        ?.send(
          new MessageEmbed()
            .setColor(Color.Primary)
            .setDescription(returnMessage)
        )
        .then((msg) => msg.delete({ timeout: 6e3 }));
  }
}

type args = {
  amount: number;
  silent: boolean;
  includePins: boolean;
};
