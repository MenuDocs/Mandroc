import { command, Embed, MandrocCommand, PermissionLevel, updateTag } from "@lib";

import type { Tag } from "@prisma/client";
import type { Message } from "discord.js";

@command("tag-edit", {
  args: [
    {
      id: "tag",
      type: "tag",
      prompt: {
        start: "I need a tag you donut.",
        retry: "ARE YA FUCKIN SCHUPID YA DONUT! GIV ME A DAMN TAG"
      }
    },
    {
      id: "contents",
      match: "rest",
      prompt: {
        start: "mate, are ya dumb.",
        retry: "JUST GIVE ME SOME CONTENT NAME YA DONUT."
      }
    }
  ],
  permissionLevel: PermissionLevel.Helper
})
export class EditTagSubCommand extends MandrocCommand {
  async exec(message: Message, {
    tag,
    contents
  }: args) {
    const embed = Embed.Primary(`Updating the tag \`${tag.name}\` with the supplied contents.`);
    message.util?.send(embed);

    /* update the tag. */
    await updateTag(tag.id, { contents });
  }
}

type args = {
  tag: Tag;
  contents: string;
}
