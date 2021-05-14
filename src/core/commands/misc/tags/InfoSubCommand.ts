import { command, Embed, MandrocCommand } from "@lib";
import type { Tag } from "@prisma/client";
import type { Message } from "discord.js";

@command("tag-info", {
  args: [
    {
      id: "tag",
      type: "tag",
      prompt: {
        start: "Please give me a tag that actually exists."
      }
    }
  ]
})
export default class InfoSubCommand extends MandrocCommand {
  public async exec(message: Message, { tag }: args) {
    const author = await this.client.users.fetch(tag.authorId);

    const embed = Embed.primary()
      .setAuthor(author.username, author.displayAvatarURL())
      .setDescription([
        `**Created At**: ${new Date(tag.createdAt).toLocaleString()}`,
        `**Uses**: ${tag.uses.toLocaleString()}`,
        `**Content Length**: ${tag.contents.length.toLocaleString()}`,
        `**Aliases**: ${tag.aliases.map(a => `\`${a}\``).join(", ") || "none"}`,
        `**Embedded**: ${tag.embedded ? "yes" : "no"}`,
        `**Category**: ${tag.category}`,
        `**Contents**: use the \`tag source\` command ;)`
      ]);

    return message.util?.send(embed);
  }
}

type args = {
  tag: Tag;
};
