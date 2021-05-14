import { adminCommand, Embed, MandrocCommand } from "@lib";

import type { GuildMember, Message } from "discord.js";
import { AntiMassModeration } from "../../../lib/administrative/automation/modules/AntiMassModeration";

@adminCommand("kick", {
  aliases: ["kick", "k"],
  editable: false,
  args: [
    {
      id: "target",
      type: "member",
      prompt: {
        start: "Please provide a user to kick.",
        retry: "I need a user to kick."
      }
    },
    {
      id: "reason",
      match: "rest",
      prompt: {
        start: "Please provide a reason for this kick.",
        retry: "I need a reason for this kick."
      }
    }
  ]
})
export default class KickCommand extends MandrocCommand {
  async exec(message: Message, { target, reason }: args) {
    if (!target.manageable) {
      const embed = Embed.warning(
        "You do not have permission to interact with them."
      );
      return message.util?.send(embed);
    }

    await this.client.moderation.kick({
      moderator: message.member!,
      offender: target,
      reason: reason
    });

    const response = Embed.success(
      `Successfully kicked **${target}** \`(${target.id})\``
    );

    AntiMassModeration.incrementCommandUsage(message);
    return message.util?.send(response);
  }
}

type args = {
  target: GuildMember;
  reason: string;
};
