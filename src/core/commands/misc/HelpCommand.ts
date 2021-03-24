/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { Color, command, MandrocCommand, PermissionLevel } from "@lib";
import type { Message } from "discord.js";
import { MessageEmbed } from "discord.js";

const DEFAULT_COMMAND_DESCRIPTION = {
  content: "No description provided.",
  examples: () => [],
  usage: "",
};

@command("help", {
  aliases: [ "help", "halp", "commands" ],
  description: {
    content: "Shows all commands that the invoker are able to use.",
    examples: (prefix: string) => [ `${prefix}help ban` ],
    usage: "[command]",
  },
  args: [
    {
      id: "command",
      type: "commandAlias",
    },
  ],
})
export default class HelpCommand extends MandrocCommand {
  public exec(message: Message, { command }: args): any {
    const embed = new MessageEmbed()
      .setColor(Color.PRIMARY)
      .setAuthor(message.author.tag, message.author.displayAvatarURL())
      .setTimestamp();

    if (!command) {
      embed
        .setThumbnail(this.client.user?.displayAvatarURL() as string)
        .setDescription([
          "Mandroc is designed and maintained for use in the Official MenuDocs Discord.",
          "(**required** - <>, **optional** - ())",
        ]);

      const categories = this.handler.categories.filter(c => {
        switch (c.id) {
          case "administrative":
            if (!message.member) {
              return true;
            }

            return message.member.permissionLevel ? message.member.permissionLevel >= PermissionLevel.TRIAL_MOD : false;
          case "private":
            return this.client.isOwner(message.author);
          default:
            return true;
        }
      });

      for (const [ id, category ] of categories) {
        const mapped = category
          .filter((c) => c.aliases.length > 0)
          .map((c) => `\`${c.aliases[0]}\``);

        if (mapped.length) {
          embed.addField(
            `❯ ${id.capitalize()} (${mapped.length})`,
            mapped.join(", "),
          );
        }
      }

      return message.util?.send(embed);
    }

    const prefix = message.util?.parsed?.prefix ?? "!";
    const description = command.description || DEFAULT_COMMAND_DESCRIPTION;

    embed
      .setDescription(description.content)
      .addField("❯ General Information", [
        `**Category**: ${command.category.id}`,
        `**Aliases**: ${command.aliases.slice(1).join(", ") || "None"}`,
        `**Accessible By**: ${PermissionLevel[command.permissionLevel].split("_").map((x: string) => x.capitalize(true))
          .join(" ")}`,
        `**Usage**: \`${prefix}${command.aliases[0]}${
          description.usage ? ` ${description.usage}` : ""
        }\``,
      ]);

    if (description.examples) {
      const examples: string[] =
        typeof description.examples === "function"
          ? description.examples(prefix)
          : description.examples;

      if (examples.length) {
        embed.addField(
          "❯ Examples",
          examples.map((e) => `\`${e}\``),
        );
      }
    }

    return message.util?.send(embed);
  }
}

type args = {
  command: MandrocCommand;
};
