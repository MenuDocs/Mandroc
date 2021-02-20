/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { adminCommand, Embed, MandrocCommand, PermissionLevel } from "@lib";

import type { GuildMember, Message } from "discord.js";
import ms from "ms";
import { AntiMassModeration } from "../../../lib/administrative/automation/modules/AntiMassModeration";

@adminCommand("ban", {
  aliases: ["ban", "b", "banish"],
  editable: false,
  clientPermissions: ["BAN_MEMBERS"],
  permissionLevel: PermissionLevel.ADMIN,
  args: [
    {
      id: "target",
      type: "member",
      prompt: {
        start: "Please provide someone to ban.",
        retry: "I need someone to ban.",
      },
    },
    {
      id: "duration",
      type: "duration",
      match: "option",
      flag: ["-d", "--duration"],
    },
    {
      id: "noDm",
      match: "flag",
      flag: ["-ndm", "--no-dm"],
    },
    {
      id: "reason",
      match: "rest",
      prompt: {
        start: "Please provide a reason for this ban.",
        retry: "I need a reason for this ban.",
      },
    },
  ],
})
export default class BanCommand extends MandrocCommand {
  public async exec(message: Message, { target, duration, reason }: args) {
    if (!target.manageable) {
      const embed = Embed.Warning(
        `You do not have permission to interact with ${target} \`(${target.id})\`.`
      );
      return message.util?.send(embed);
    }

    if (message.deletable) {
      message.delete();
    }

    await this.client.moderation.ban({
      moderator: message.member!,
      offender: target,
      reason: reason,
      duration,
    });

    const embed = Embed.Success(
      `Successfully banned **${target}** \`(${target.id})\` ${
        duration ? `for **${ms(duration, { long: true })}**` : "permanently"
      }`
    );

    AntiMassModeration.incrememtCommandUsage(message);
    return message.channel.send(embed).then((m) => m.delete({ timeout: 6000 }));
  }
}

type args = {
  target: GuildMember;
  duration: number;
  reason: string;
};
