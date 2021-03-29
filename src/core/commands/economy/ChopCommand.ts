/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { command, Embed, MandrocCommand, PermissionLevel } from "@lib";
import ms from "ms";

import type { Message } from "discord.js";

@command("chop", {
  aliases: [ "chop" ],
  description: {
    content: "Chops trees.",
    examples: (prefix: string) => [ `${prefix}chop` ],
    usage: "",
  },
})
export default class ChopCommand extends MandrocCommand {
  public async exec(message: Message) {
    const profile = await message.member!.getProfile(),
      logs = [ "oak", "birch", "apple", "pine" ].shuffle();

    if (!profile.inventory.find(x => x.name === "axe")) {
      return message.util?.send(Embed.Warning("You must possess an axe to run this command."));
    }

    if (profile.lastChopped) {
      const remaining = Date.now() - profile.lastChopped;
      if (ms("25m") > remaining) {
        const embed = Embed.Warning(`Woah! it was only **${ms(remaining, { long: true })}** before your last chop session, it's good to take a nice \`25 minute\` break between each session :)`);
        return message.util?.send(embed);
      }
    }

    const logAmounts = [ ...Array(10).keys() ].slice(1).shuffle(),
      chance = message.member?.permissionLevel === PermissionLevel.DONATOR ? .40 : .20;

    profile.lastChopped = Date.now();
    if (Math.random() <= chance) {
      const earned = logAmounts.reduce((acc, x) => acc + x * 8, 0),
        chopped = logs
          .map((x, i) => `*${logAmounts[i]} ${x} logs*`)
          .join(", ");

      message.util?.send(Embed.Success(`Wow! You got ${chopped}, and earned **${earned * 8} ₪**`));

      // update pocket
      profile.pocket += earned;
    } else {
      message.util?.send(Embed.Warning("Yikes. The forest you went to burnt down, and it's too late to go to another."));
    }

    await profile.save();
  }
}