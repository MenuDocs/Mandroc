import { command, Embed, MandrocCommand, PermissionLevel, Tag } from "@lib";
import type { Message } from "discord.js";

@command("tag-rename", {
  args: [
    {
      id: "tag",
      type: "tag",
      prompt: {
        start: "I need a tag to rename.",
      },
    },
    {
      id: "name",
      prompt: {
        start: "I need a new name for that tag.",
      },
    },
  ],
  permissionLevel: PermissionLevel.Helper,
})
export default class RemoveSubCommand extends MandrocCommand {
  public async exec(message: Message, { tag, name }: args) {
    if (tag.name.toLowerCase() === name.toLowerCase()) {
      return message.util?.send(
        Embed.Primary(`That tag is already named \`${name}\``)
      );
    }

    if (tag.aliases.some((a) => a.toLowerCase() === name.toLowerCase())) {
      return message.util?.send(
        Embed.Primary(
          `The tag, **${tag.name}**, has an alias named \`${name}\`. Please remove it before renaming the tag.`
        )
      );
    }

    message.util?.send(
      Embed.Primary(`Renamed tag **${tag.name}** to \`${name}\``)
    );
    tag.name = name;
    return tag.save();
  }
}

type args = {
  tag: Tag;
  name: string;
};
