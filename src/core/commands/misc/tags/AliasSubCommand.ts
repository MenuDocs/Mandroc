import { command, Embed, MandrocCommand, PermissionLevel, Tag } from "@lib";
import type { Message } from "discord.js";

@command("tag-alias", {
  args: [
    {
      id: "tag",
      type: "tag",
      prompt: {
        start: "I need a tag.",
      },
    },
    {
      id: "alias",
      type: "lowercase",
      prompt: {
        start: "I need an alias to add/remove.",
      },
    },
  ],
  permissionLevel: PermissionLevel.HELPER,
})
export default class AliasSubCommand extends MandrocCommand {
  public async exec(message: Message, { tag, alias }: args) {
    const i = tag.aliases.findIndex((a) => a.toLowerCase() === alias);
    if (i !== -1) {
      tag.aliases.splice(i, 1);
      message.util?.send(
        Embed.Primary(
          `The alias, \`${alias}\`, has been removed from tag **${tag.name}**.`
        )
      );
    } else {
      tag.aliases.push(alias);
      message.util?.send(
        Embed.Primary(
          `The alias, \`${alias}\`, has been added to tag **${tag.name}**.`
        )
      );
    }

    return tag.save();
  }
}

type args = {
  method: "add" | "remove";
  tag: Tag;
  alias: string;
};
