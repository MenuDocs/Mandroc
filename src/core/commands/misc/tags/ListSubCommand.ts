import { command, Database, Embed, MandrocCommand } from "@lib";

import type { Message } from "discord.js";

@command("tag-list")
export default class ListSubCommand extends MandrocCommand {
  public async exec(message: Message) {
    if (!(await Database.PRISMA.tag.count)) {
      const embed = Embed.Primary("It's pretty empty in here. No one has added a tag yet :(");
      return message.util?.send(embed);
    }

    /* get all tags. */
    const tags = await Database.PRISMA.tag.findMany({
      select: {
        category: true,
        name: true
      }
    });

    /* get all categories. */
    const categories = new Set([ ...tags.map(tag => tag.category) ]);

    /* create embed */
    const embed = Embed.Primary(`These are the available tags for the MenuDocs server. There are a total of **${tags.length}** tags.`)
      .setThumbnail(this.client.user!.displayAvatarURL())
      .setTitle("All Tags");

    for (const category of categories) {
      const categorized = tags.filter(tag => tag.category === category),
        formatted = categorized.map(tag => `\`${tag.name}\``).join(", ");

      embed.addField(
        `❯ ${category.capitalize()} (${categorized.length})`,
        formatted
      );
    }

    return message.util?.send(embed);
  }
}
