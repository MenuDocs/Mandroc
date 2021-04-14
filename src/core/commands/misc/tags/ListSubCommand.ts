import { command, Embed, MandrocCommand, Tag } from "@lib";

import type { Message } from "discord.js";

@command("tag-list")
export default class ListSubCommand extends MandrocCommand {
  public async exec(message: Message) {
    const tags = await Tag.find(),
      categories = new Set([...tags.map(tag => tag.category)]),
      embed = Embed.Primary();

    if (!tags.length) {
      embed.setDescription(
        "It's pretty empty in here. No one has added a tag yet :("
      );
      return message.util?.send(embed);
    }

    embed
      .setThumbnail(this.client.user!.displayAvatarURL())
      .setTitle("All Tags")
      .setDescription(
        `These are the available tags for the MenuDocs server. There are a total of **${tags.length}** tags.`
      );

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
