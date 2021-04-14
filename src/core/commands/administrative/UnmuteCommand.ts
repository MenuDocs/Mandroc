import {
  adminCommand,
  Embed,
  IDs,
  Infraction,
  InfractionType,
  MandrocCommand,
  Moderation
} from "@lib";
import { captureException } from "@sentry/node";

import type { GuildMember, Message } from "discord.js";

@adminCommand("unmute", {
  aliases: ["unmute"],
  args: [
    {
      id: "member",
      type: "member",
      prompt: {
        start: "I need someone to unmute.",
        retry: "I need someone to unmute."
      }
    },
    {
      id: "reason",
      match: "rest",
      prompt: {
        start: "Please provide a reason for un-muting this member.",
        retry: "Please provide a reason for un-muting this member."
      }
    }
  ]
})
export class UnmuteCommand extends MandrocCommand {
  async exec(message: Message, { member, reason }: args) {
    if (!member.roles.cache.has(IDs.MUTED)) {
      const embed = Embed.Warning(`${member} is not muted.`);
      return message.util?.send(embed);
    }

    const infraction = await Infraction.findOne({
      where: {
        offenderId: member.id,
        type: InfractionType.MUTE
      },
      order: { id: "DESC" }
    });

    if (message.deletable) {
      message.delete().catch(captureException);
    }

    await this.moderation.unmute({
      offender: member,
      moderator: message.author,
      reason
    });

    const origin = infraction
      ? `was **[Case ${infraction.id}](${Moderation.lcurl}/${infraction.messageId})**`
      : "is unknown";

    return message.channel
      .send(Embed.Primary(`Unmuted **${member}**, their mute origin ${origin}`))
      .then(m => m.delete({ timeout: 5000 }));
  }
}

type args = {
  member: GuildMember;
  reason: string;
};
