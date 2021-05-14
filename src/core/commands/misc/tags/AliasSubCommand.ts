import { command, Database, Embed, MandrocCommand, PermissionLevel, updateTag } from "@lib";
import type { Tag } from "@prisma/client";
import type { Message } from "discord.js";

@command("tag-alias", {
  args: [
    {
      id: "tag",
      type: "tag",
      prompt: {
        start: "I need a tag.",
        retry: "I need a tag bruh."
      }
    },
    {
      id: "alias",
      type: "lowercase",
      prompt: {
        start: "I need an alias to add/remove."
      }
    }
  ],
  permissionLevel: PermissionLevel.Helper
})
export default class AliasSubCommand extends MandrocCommand {
  public async exec(message: Message, {
    tag,
    alias
  }: args) {
    const i = tag.aliases.findIndex(a => a.toLowerCase() === alias);
    if (i !== -1) {
      tag.aliases.splice(i, 1);
    } else {
      const conflictingTag = await Database.findTag(alias);
      if (conflictingTag) {
        const embed = Embed.danger(`The tag **${conflictingTag.name}** has a conflicting name or alias.`);
        return message.util?.send(embed);
      }

      tag.aliases.push(alias);
    }

    const embed = Embed.primary(`The alias, \`${alias}\`, has been ${i === -1 ? "added to" : "removed from"} tag **${tag.name}**.`);
    await message.util?.send(embed);

    await updateTag(tag.id, {
      aliases: tag.aliases
    });
  }
}

type args = {
  tag: Tag;
  alias: string;
};
