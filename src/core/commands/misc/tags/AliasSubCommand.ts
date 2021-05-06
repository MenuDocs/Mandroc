import { command, Database, Embed, MandrocCommand, PermissionLevel } from "@lib";
import type { Tag } from "@prisma/client";
import type { Message } from "discord.js";

@command("tag-alias", {
  args: [
    {
      id: "tag",
      type: "tag",
      prompt: {
        start: "I need a tag."
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
  public async exec(message: Message, { tag, alias }: args) {
    const conflictingTag = await Database.findTag(alias);
    if (conflictingTag) {
      const embed = Embed.Danger(`The tag **${conflictingTag.name}** has a conflicting name or alias.`);
      return message.util?.send(embed);
    }

    const i = tag.aliases.findIndex(a => a.toLowerCase() === alias);
    if (i !== -1) {
      tag.aliases.splice(i, 1);

      const embed = Embed.Primary(`The alias, \`${alias}\`, has been removed from tag **${tag.name}**.`);
      await message.util?.send(embed);
    } else {
      tag.aliases.push(alias);

      const embed = Embed.Primary(`The alias, \`${alias}\`, has been added to tag **${tag.name}**.`);
      await message.util?.send(embed);
    }

    await Database.PRISMA.tag.update({
      where: { id: tag.id },
      data: {
        aliases: {
          push: alias
        }
      }
    });
  }
}

type args = {
  tag: Tag;
  alias: string;
};
