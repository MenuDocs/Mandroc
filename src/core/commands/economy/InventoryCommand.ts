import { command, Database, Embed, MandrocCommand } from "@lib";
import type { Message } from "discord.js";

@command("inventory", {
  aliases: [ "inventory", "tools", "inv" ],
  description: {
    content: "Displays your inventory.",
    examples: (prefix: string) => [ `${prefix}inventory` ],
    usage: "!inventory"
  }
})
export default class FishCommand extends MandrocCommand {
  public async exec(message: Message) {
    /* get all inventory items. */
    const inventory = await Database.PRISMA.inventoryItem.findMany({
      where: { profileId: message.author.id },
      include: {
        item: true
      }
    });

    /* check for an empty inventory. */
    if (!inventory.length) {
      return message.util?.send(Embed.Primary("Oh, you have no items in your inventory!"));
    }

    const embed = Embed.Primary()
      .setTitle(`**${message.author.username}**'s Inventory`);

    /* map out categories. */
    const types = new Set(inventory.map(i => i.item.type));
    for (const type in types) {
      const items = inventory.filter(i => i.item.type === type);
      embed.addField(
        `❯ ${type.capitalize()}`,
        items
          .map(i => `\`[${i.id}]\` **${i.item.name}**`)
          .join("\n")
      );
    }

    message.util?.send(embed);
  }
}
