/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { adminCommand, Embed, MandrocCommand } from "@lib";

import type { GuildMember, Message } from "discord.js";

@adminCommand("ban", {
  aliases: ["ban", "b", "banish"],
  editable: false,
  clientPermissions: ["BAN_MEMBERS"],
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
    {},
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

    if (message.deletable) {
      message.delete();
    }

    await this.client.moderation.ban({
      moderator: message.member!,
      offender: target,
      reason: reason,
    });

    return message.util?.send(Embed.Success(`Successfully banned ${target}`));
  }
}

type args = {
  target: GuildMember;
  reason: string;
};
