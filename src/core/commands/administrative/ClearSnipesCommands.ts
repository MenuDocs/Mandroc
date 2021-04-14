import { adminCommand, Embed, MandrocCommand } from "@lib";
import type { Message, TextChannel } from "discord.js";

@adminCommand("clearSnipes", {
  aliases: ["clear-snipes"],
  args: [
    {
      id: "channel",
      default: (m: Message) => m.channel,
      type: "textChannel"
    }
  ]
})
export class ClearSnipesCommand extends MandrocCommand {
  async exec(message: Message, { channel }: args) {
    channel.lastDeletedMessages = [];
    await message.util?.send(
      Embed.Primary(
        `Successfully cleared the snipes for **${channel}** \`(${channel.id})\``
      )
    );
  }
}

type args = {
  channel: TextChannel;
};
