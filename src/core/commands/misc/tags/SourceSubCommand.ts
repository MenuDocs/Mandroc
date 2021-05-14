import { code, command, Embed, MandrocCommand } from "@lib";

import type { Tag } from "@prisma/client";
import type { Message } from "discord.js";

@command("tag-source", {
  args: [
    {
      id: "tag",
      type: "tag",
      prompt: {
        start: "I need a tag."
      }
    }
  ]
})
export default class SourceSubCommand extends MandrocCommand {
  public async exec(message: Message, { tag }: args) {
    return message.util?.send(Embed.primary(code("md")`${tag.contents}`));
  }
}

type args = {
  tag: Tag;
};
