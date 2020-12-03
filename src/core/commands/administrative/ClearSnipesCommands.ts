import { command, Embed, MandrocCommand, PermissionLevel } from "@lib";
import type { TextChannel, Message } from "discord.js";

@command("clearSnipes", {
  aliases: ["clear-snipes"],
  args: [
    {
      id: "channel",
      default: (m: Message) => m.channel,
      type: "textChannel",
    },
  ],
  permissionLevel: PermissionLevel.TrialMod,
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
