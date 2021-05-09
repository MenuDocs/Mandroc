import { command, Embed, MandrocCommand, PermissionLevel, updateTag } from "@lib";

import type { Tag } from "@prisma/client";
import type { Message } from "discord.js";

@command("tag-rename", {
  args: [
    {
      id: "tag",
      type: "tag",
      prompt: {
        start: "I need a tag to rename."
      }
    },
    {
      id: "name",
      prompt: {
        start: "I need a new name for that tag."
      }
    }
  ],
  permissionLevel: PermissionLevel.Helper
})
export default class RenameTagSubCommand extends MandrocCommand {
  public async exec(message: Message, {
    tag,
    name
  }: args) {
    /* check for redundant rename */
    if (tag.name.toLowerCase() === name.toLowerCase()) {
      const embed = Embed.Primary(`That tag is already named \`${name}\``);
      return message.util?.send(embed);
    }

    /* check for conflicting aliases. */
    if (tag.aliases.some(a => a.toLowerCase() === name.toLowerCase())) {
      const embed = Embed.Primary([
        `The tag, **${tag.name}**, has an alias named \`${name}\`.`,
        `Please remove it before renaming the tag.`
      ]);

      return message.util?.send(embed);
    }

    /* send embed. */
    const embed = Embed.Primary(`Renamed tag **${tag.name}** to \`${name}\``);
    message.util?.send(embed);

    /* update tag */
    await updateTag(tag.id, { name })
  }
}

type args = {
  tag: Tag;
  name: string;
};
