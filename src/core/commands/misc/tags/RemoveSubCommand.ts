import { command, Database, Embed, MandrocCommand, PermissionLevel } from "@lib";

import type { Tag } from "@prisma/client";
import type { Message } from "discord.js";

@command("tag-remove", {
  args: [
    {
      id: "tag",
      type: "tag",
      prompt: {
        start: "I need a tag to delete.",
        retry: "I need a tag to delete."
      }
    }
  ],
  permissionLevel: PermissionLevel.Helper
})
export default class RemoveSubCommand extends MandrocCommand {
  public async exec(message: Message, { tag }: args) {
    await Database.PRISMA.tag.delete({
      where: { id: tag.id }
    });

    return message.util?.send(Embed.primary(`Successfully removed the tag **${tag.name}**.`));
  }
}

type args = {
  tag: Tag;
};
