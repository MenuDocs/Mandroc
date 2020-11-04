/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { command, Embed, MandrocCommand, PermissionLevel, Tag } from "@lib";
import type { Message } from "discord.js";

@command("tag-category", {
  args: [
    {
      id: "tag",
      type: "tag",
      prompt: {
        start: "I need a tag you donut.",
        retry: "ARE YA FUCKIN SCHUPID YA DONUT! GIV ME A DAMN TAG",
      },
    },
    {
      id: "category",
      prompt: {
        start: "mate, are ya dumb.",
        retry: "JUST GIVE ME A CATEGORY NAME YA DONUT.",
      },
    },
  ],
  permissionLevel: PermissionLevel.Helper,
})
export default class CategorySubCommand extends MandrocCommand {
  public async exec(message: Message, { tag, category }: args) {
    const old = tag.category;
    tag.category = category;
    await tag.save();

    return message.util?.send(
      Embed.Primary(
        `I changed the category of tag **${tag.name}** from \`${old}\` to \`${category}\``
      )
    );
  }
}

type args = {
  tag: Tag;
  category: string;
};
