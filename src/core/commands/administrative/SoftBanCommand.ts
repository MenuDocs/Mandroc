/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { adminCommand, Embed, MandrocCommand, PermissionLevel } from "@lib";

import type { GuildMember, Message } from "discord.js";
import { AntiMassModeration } from "../../../lib/administrative/automation/modules/AntiMassModeration";

@adminCommand("softban", {
  aliases: ["softban", "sb", "softbanish"],
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
      id: "delDays",
      type: "number",
      match: "option",
      flag: ["-dd", "--del-days"],
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
export default class SoftBanCommand extends MandrocCommand {
  public async exec(message: Message, { target, delDays, reason }: args) {
    if (!target.manageable) {
      const embed = Embed.Warning(
        `You do not have permission to interact with ${target} \`(${target.id})\`.`
      );
      return message.util?.send(embed);
    }

    if (message.deletable) {
      message.delete();
    }

    await this.client.moderation.softBan({
      moderator: message.member!,
      offender: target,
      delDays,
      reason,
    });

    await message.guild?.members.unban(target);

    const embed = Embed.Success(
      `Successfully soft-banned **${target}** \`(${target.id})\``
    );

    AntiMassModeration.incrementCommandUsage(message);
    return message.channel.send(embed).then((m) => m.delete({ timeout: 6000 }));
  }
}

type args = {
  target: GuildMember;
  delDays: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  reason: string;
};
