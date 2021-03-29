/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { command, Embed, MandrocCommand, PermissionLevel, Tag } from "@lib";
import { render } from "mustache";

import type { Message, TextChannel } from "discord.js";

const SUPPORT_CATEGORIES = [ "762898487372677138", "762898487527473154" ];

@command("tag-show", {
  args: [
    {
      id: "name",
      match: "content",
      type: "lowercase",
      prompt: {
        start: "Giv content pls.",
      },
    },
  ],
  channel: "guild",
})
export default class ShowSubCommand extends MandrocCommand {
  public async exec(message: Message, { name }: args) {
    if (!name) {
      return;
    }

    const tag: Tag = await this.handler.resolver.type("tag")(message, name);
    if (!tag) {
      return;
    }

    if (
      tag.perms.roles.length &&
      !tag.perms.roles.some((r) => message.member!.roles.cache.has(r))
    ) {
      return;
    }

    if (
      tag.perms.staffOnly &&
      message.member!.permissionLevel! < PermissionLevel.MOD
    ) {
      return;
    }

    if (
      tag.perms.supportOnly &&
      message.member!.permissionLevel! < PermissionLevel.MOD
    ) {
      if (
        !SUPPORT_CATEGORIES.includes((message.channel as TextChannel).parentID!)
      ) {
        return;
      }
    }

    const view = {
      author: {
        id: message.author.id,
        name: message.author.username,
        discrim: message.author.discriminator,
        avatar: message.author.avatarURL(),
        tag: message.author.tag,
        nickname: message.member?.nickname,
      },

      guild: {
        memberCount: message.guild!.members.cache.size,
      },
    };

    const contents = render(tag.contents, view);
    message.util?.send(tag.embedded ? Embed.Primary(contents) : contents);
    tag.uses++;

    return tag.save();
  }
}

type args = {
  name: string;
};
