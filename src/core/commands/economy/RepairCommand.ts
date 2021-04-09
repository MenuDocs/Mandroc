import { command, Embed, MandrocCommand, PermissionLevel } from "@lib";
import type { Message } from "discord.js";

@command("repair", {
  aliases: [ "repair" ],
  permissionLevel: PermissionLevel.Donor,
  description: {
    content: "Repairs your entire inventory.",
    examples: (prefix: string) => [ `${prefix}repair` ],
  },
})
export default class ChopCommand extends MandrocCommand {
  public async exec(message: Message) {
    const profile = await message.member!.getProfile();
    if (!profile.inventory.length) {
      return message.util?.send(Embed.Primary("You dont have anything in your inventory."));
    }

    const toRepair = profile.inventory.filter(i => i.durability !== 100);
    if (!toRepair.length) {
      return message.util?.send(Embed.Primary("Nothing in your inventory is repairable."));
    }

    for (const item of toRepair) {
      item.durability = 100;
    }

    await profile.save();
    return message.util?.send(Embed.Success("All items in your inventory have been repaired."));
  }
}