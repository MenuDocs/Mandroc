import { adminCommand, Embed, MandrocCommand } from "@lib";

import type { GuildMember, Message } from "discord.js";

@adminCommand("kick", {
  aliases: ["kick", "k"],
  editable: false,
  args: [
    {
      id: "target",
      type: "member",
      prompt: {
        start: "Please provide a user to warn.",
        retry: "I need a user to warn.",
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
export default class WarnCommand extends MandrocCommand {
  public async exec(message: Message, { target, reason }: args) {
    if (message.member?.permissionLevel!! <= target.permissionLevel!!) {
      const embed = Embed.Warning(
        "You do not have permission to interact with them."
      );
      return message.util?.send(embed);
    }

    this.client.moderation.kick({
      moderator: message.member!,
      offender: target,
      reason: reason,
    });
    const memberEmbed = Embed.Danger(
      `You have been kicked off the MenuDocs server for \`${reason}\``
    );
    if (target.kickable) {
      target
        .send(memberEmbed)
        .then(() => target.kick(reason))
        .catch();
    }

    const response = Embed.Success(`Successfully kicked ${target}`);
    message.util?.send(response);
  }
}

type args = {
  target: GuildMember;
  reason: string;
};
