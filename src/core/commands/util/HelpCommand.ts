import { Color, command, MandrocCommand } from "@lib";
import type { Message } from "discord.js";
import { MessageEmbed } from "discord.js";

@command("help", {
  aliases: ["help", "halp", "commands"],
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
      .setColor(Color.Primary)
      .setTimestamp()
      .setThumbnail(this.client.user?.avatarURL() as string);

    if (!command) {
      embed
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
        .setDescription([
          "Mandroc is designed and maintained for use in the Official MenuDocs Discord.",
          "(**required** - <>, **optional** - ())",
        ]);

      for (const [id, category] of this.handler.categories) {
        const mapped = category
          .filter((c) => c.aliases.length > 0)
          .map((c) => `\`${c.aliases[0]}\``);

        if (mapped.length)
          embed.addField(
            `❯ ${id.capitalize()} (${mapped.length})`,
            mapped.join(", ")
          );
      }

      return message.util?.send(embed);
    }
  }
}

type args = {
  command: MandrocCommand;
};
