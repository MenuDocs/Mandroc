import { command, Embed, MandrocCommand, PermissionLevel, updateTag } from "@lib";

import type { Tag } from "@prisma/client";
import type { Message } from "discord.js";

@command("tag-category", {
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
      id: "category",
      prompt: {
        start: "mate, are ya dumb.",
        retry: "JUST GIVE ME A CATEGORY NAME YA DONUT."
      }
    }
  ],
  permissionLevel: PermissionLevel.Helper
})
export default class CategorySubCommand extends MandrocCommand {
  public async exec(message: Message, {
    tag,
    category
  }: args) {
    await updateTag(tag.id, { category });

    const embed = Embed.primary(`I changed the category of tag **${tag.name}** from \`${tag.category}\` to \`${category}\``);
    return message.util?.send(embed);
  }
}

type args = {
  tag: Tag;
  category: string;
};
