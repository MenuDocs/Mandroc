/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { command, Embed, MandrocCommand, PermissionLevel, Tag } from "@lib";

import type { Message, TextChannel } from "discord.js";

const SUPPORT_CATEGORIES = ["762898487372677138", "762898487527473154"];

@command("tag-show", {
  args: [
    {
      id: "tag",
      type: "tag",
      prompt: {
        start: "Give me a tag bruh",
      },
    },
  ],
  channel: "guild",
})
export default class ShowSubCommand extends MandrocCommand {
  public async exec(message: Message, { tag }: args) {
    if (
      tag.perms.roles.length &&
      !tag.perms.roles.some((r) => message.member!.roles.cache.has(r))
    ) {
      return;
    }

    if (
      tag.perms.staffOnly &&
      message.member!.permissionLevel! < PermissionLevel.Mod
    ) {
      return;
    }

    if (
      tag.perms.supportOnly &&
      message.member!.permissionLevel! < PermissionLevel.Mod
    ) {
      if (
        !SUPPORT_CATEGORIES.includes((message.channel as TextChannel).parentID!)
      ) {
        return;
      }
    }

    message.util?.send(
      tag.embedded ? Embed.Primary(tag.contents) : tag.contents
    );
    tag.uses++;
    return tag.save();
  }
}

type args = {
  tag: Tag;
};
