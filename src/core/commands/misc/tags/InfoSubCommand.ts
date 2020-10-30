import { command, Embed, MandrocCommand, Tag } from "@lib";
import type { Message } from "discord.js";

@command("tag-info", {
  args: [
    {
      id: "tag",
      type: "tag",
      prompt: {
        start: "Please give me a tag that actually exists.",
      },
    },
  ],
})
export default class InfoSubCommand extends MandrocCommand {
  public async exec(message: Message, { tag }: args) {
    const author = await this.client.users.fetch(tag.authorId);

    const embed = Embed.Primary()
      .setAuthor(author.username, author.displayAvatarURL())
      .setDescription([
        `**Created At**: ${new Date(tag.createdAt).toLocaleString()}`,
        `**Uses**: ${tag.uses.toLocaleString()}`,
        `**Content Length**: ${tag.contents.length.toLocaleString()}`,
        `**Aliases**: ${
          tag.aliases.map((a) => `\`${a}\``).join(", ") || "none"
        }`,
        `**Embedded**: ${tag.embedded ? "yes" : "no"}`,
        `**Category**: ${tag.category}`,
      ]);

    return message.util?.send(embed);
  }
}

type args = {
  tag: Tag;
};
