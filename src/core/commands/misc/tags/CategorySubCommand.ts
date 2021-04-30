import { command, Database, Embed, MandrocCommand, PermissionLevel } from "@lib";

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
    await Database.PRISMA.tag.update({
      where: tag,
      data: { category }
    });

    const embed = Embed.Primary(`I changed the category of tag **${tag.name}** from \`${tag.category}\` to \`${category}\``);
    return message.util?.send(embed);
  }
}

type args = {
  tag: Tag;
  category: string;
};
