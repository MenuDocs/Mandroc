/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { adminCommand, Embed, IDs, MandrocCommand } from "@lib";
import { captureException } from "@sentry/node";
import ms from "ms";

import type { GuildMember, Message } from "discord.js";

@adminCommand("timeout", {
  aliases: ["timeout"],
  args: [
    {
      id: "member",
      type: "member",
      prompt: {
        start: "I need a member to timeout.",
        retry: "I need a member to timeout.",
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
        retry: "You have to provide a reason for timing out this member.",
      },
    },
  ],
})
export class TimeoutCommand extends MandrocCommand {
  async exec(message: Message, { duration, member, reason }: args) {
    if (member.roles.cache.has(IDs.TIMED_OUT)) {
      const embed = Embed.Warning("That member is already timed out.");
      return message.util?.send(embed);
    }

    await this.moderation.timeout({
      offender: member,
      moderator: message.author,
      reason,
      duration,
    });

    if (message.deletable) {
      message.delete().catch(captureException);
    }

    const embed = Embed.Primary(`Successfully timed out **${member}** for ${ms(duration, { long: true })} with reason \`${reason}\``);

    return message.channel.send(embed).then((m) => m.delete({ timeout: 6000 }));
  }
}

type args = {
  duration: number;
  member: GuildMember;
  reason: string;
};
