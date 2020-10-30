import { adminCommand, Embed, MandrocCommand } from "@lib";

import type { GuildMember, Message } from "discord.js";

@adminCommand("ban", {
  aliases: ["ban", "b", "banish"],
  editable: false,
  args: [
    {
      id: "target",
      type: "member",
      prompt: {
        start: "Please provide a user to ban.",
        retry: "I need a user to ban.",
      },
    },
    {
      id: "reason",
      match: "rest",
      prompt: {
        start: "Please provide a reason for this infraction.",
        retry: "I need a reason for this infraction.",
      },
    },
  ],
})
export default class BanCommand extends MandrocCommand {
  public async exec(message: Message, { target, reason }: args) {
    if (message.member?.permissionLevel! <= target.permissionLevel!) {
      const embed = Embed.Warning(
        "You do not have permission to interact with them."
      );
      return message.util?.send(embed);
    }

    await this.client.moderation.ban({
      moderator: message.member!,
      offender: target,
      reason: reason,
    });
    const memberEmbed = Embed.Danger(
      `You have been banned off the MenuDocs server for \`${reason}\``
    );
    if (target.bannable) {
      try {
        target.send(memberEmbed);
        target.ban({ reason });
      } catch (ignored) {}

      target.ban({ reason });
    }

    const response = Embed.Success(`Successfully banned ${target}`);
    message.util?.send(response);
  }
}

type args = {
  target: GuildMember;
  reason: string;
};
