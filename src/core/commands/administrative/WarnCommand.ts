import { adminCommand, Embed, MandrocCommand } from "@lib";
import { captureException } from "@sentry/node";

import type { GuildMember, Message } from "discord.js";
import { AntiMassModeration } from "../../../lib/administrative/automation/modules/AntiMassModeration";

@adminCommand("warn", {
  aliases: ["warn"],
  args: [
    {
      id: "offender",
      type: "member",
      prompt: {
        start: "Please provide a user to warn.",
        retry: "I need a user to warn."
      }
    },
    {
      id: "reason",
      match: "rest",
      prompt: {
        start: "Please provide a reason for this infraction.",
        retry: "I need a reason for this infraction."
      }
    }
  ]
})
export default class WarnCommand extends MandrocCommand {
  public async exec(message: Message, { offender, reason }: args) {
    if (message.deletable) {
      message.delete().catch(captureException);
    }

    await this.client.moderation.warn({
      moderator: message.member!,
      offender: offender,
      reason
    });

    const embed = Embed.primary(
      `Successfully warned **${offender}** for \`${reason}\``
    );

    AntiMassModeration.incrementCommandUsage(message);
    await message.channel.send(embed).then(m => m.delete({ timeout: 6000 }));
  }
}

type args = {
  offender: GuildMember;
  reason: string;
};
