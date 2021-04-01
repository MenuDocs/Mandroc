/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { adminCommand, Embed, IDs, MandrocCommand } from "@lib";
import { captureException } from "@sentry/node";
import ms from "ms";

import type { GuildMember, Message } from "discord.js";
import { AntiMassModeration } from "../../../lib/administrative/automation/modules/AntiMassModeration";

@adminCommand("mute", {
  aliases: ["mute", "m", "tempmute"],
  args: [
    {
      id: "member",
      type: "member",
      prompt: {
        start: "I need a member to mute.",
        retry: "I need a member to mute.",
      },
    },
    {
      id: "duration",
      match: "tentative",
      type: "duration",
    },
    {
      id: "reason",
      match: "rest",
      prompt: {
        start: "You need to provide a reason.",
        retry: "You have to provide a reason for muting this member.",
      },
    },
  ],
})
export class MuteCommand extends MandrocCommand {
  async exec(message: Message, { duration, member, reason }: args) {
    if (member.user.id === this.client.user?.id) {
      const embed = Embed.Danger("No")
      return message.util?.send(embed);
    }

    if (member.roles.cache.has(IDs.MUTED)) {
      const embed = Embed.Warning("That member is already muted. Use *!unmute* before trying to mute them.");
      return message.util?.send(embed);
    }

    await this.moderation.mute({
      offender: member,
      moderator: message.author,
      reason,
      duration,
    });

    if (message.deletable) {
      message.delete().catch(captureException);
    }

    const dur = duration ? `for **${ms(duration, { long: true })}** ` : "",
      embed = Embed.Primary(
        `Successfully muted **${member}** ${dur}with reason \`${reason}\``
      );

    AntiMassModeration.incrementCommandUsage(message);
    return message.channel.send(embed).then((m) => m.delete({ timeout: 6000 }));
  }
}

type args = {
  duration: number;
  member: GuildMember;
  reason: string;
};
