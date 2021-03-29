/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { command, Embed, MandrocCommand, PermissionLevel } from "@lib";
import type { Message } from "discord.js";

@command("repair", {
  aliases: [ "repair" ],
  permissionLevel: PermissionLevel.DONATOR,
  description: {
    content: "Repairs your entire inventory.",
    examples: (prefix: string) => [ `${prefix}repair` ],
  },
})
export default class ChopCommand extends MandrocCommand {
  public async exec(message: Message) {
    const profile = await message.member!.getProfile();
    for (const item of profile.inventory) {
      item.durability = 100;
    }

    await profile.save();
    return message.util?.send(Embed.Success("You repaired your entire inventory."));
  }
}