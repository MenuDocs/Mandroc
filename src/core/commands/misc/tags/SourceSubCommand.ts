/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { code, command, Embed, MandrocCommand, Tag } from "@lib";
import type { Message } from "discord.js";

@command("tag-source", {
  args: [
    {
      id: "tag",
      type: "tag",
      prompt: {
        start: "I need a tag.",
      },
    },
  ],
})
export default class SourceSubCommand extends MandrocCommand {
  public async exec(message: Message, { tag }: args) {
    return message.util?.send(Embed.Primary(code("md")`${tag.contents}`));
  }
}

type args = {
  tag: Tag;
};
