import { command, Embed, MandrocCommand, PermissionLevel, updateTag } from "@lib";

import type { Tag } from "@prisma/client";
import type { Message } from "discord.js";

@command("tag-type", {
  args: [
    {
      id: "tag",
      type: "tag",
      prompt: {
        start: "I need a tag to retype."
      }
    },
    {
      id: "type",
      type: [ "embedded", "regular" ],
      prompt: {
        start: "I need a new type for that tag."
      }
    }
  ],
  permissionLevel: PermissionLevel.Helper
})
export default class TypeSubCommand extends MandrocCommand {
  public async exec(message: Message, {
    tag,
    type
  }: args) {
    const embed = Embed.primary();
    if (tag.embedded && type === "embedded") {
      embed.setDescription(`The tag, **${tag.name}**, is already of type \`embedded\``);
      return message.util?.send(embed);
    } else if (!tag.embedded && type === "regular") {
      embed.setDescription(`The tag, **${tag.name}**, is already of type \`regular\``);
      return message.util?.send(embed);
    }

    /* send message */
    embed.setDescription(`The tag, **${tag.name}**, is now of type \`${type}\``);
    message.util?.send(embed);

    /* update tag */
    await updateTag(tag.id, { embedded: type === "embedded" });
  }
}

type args = {
  tag: Tag;
  type: "embedded" | "regular";
};
