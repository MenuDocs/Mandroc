import { command, Database, Embed, MandrocCommand, PermissionLevel, ToolMetadata } from "@lib";

import type { Message } from "discord.js";

@command("repair", {
  aliases: [ "repair" ],
  permissionLevel: PermissionLevel.Donor,
  description: {
    content: "Repairs your entire inventory.",
    examples: (prefix: string) => [ `${prefix}repair` ]
  }
})
export default class ChopCommand extends MandrocCommand {
  public async exec(message: Message) {
    const inventory = await Database.PRISMA.inventoryItem.findMany({
      where: {
        profileId: message.author.id,
        item: {
          type: "Tool"
        }
      }
    });

    /* check for empty inventory. */
    if (!inventory.length) {
      const embed = Embed.primary("You dont have anything in your inventory.");
      return message.util?.send(embed);
    }

    const toRepair = inventory.filter(i => (i.metadata as ToolMetadata).durability !== 100);
    if (!toRepair.length) {
      const embed = Embed.primary("Nothing in your inventory is repairable.");
      return message.util?.send(embed);
    }

    /* repair all items in inventory. */
    for (const item of toRepair) {
      await Database.PRISMA.inventoryItem.update({
        where: { id: item.id },
        data: {
          metadata: {
            durability: 100
          }
        }
      });
    }

    const embed = Embed.success("All items in your inventory have been repaired.");
    return message.util?.send(embed);
  }
}
