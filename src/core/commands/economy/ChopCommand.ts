import { command, Database, Embed, MandrocCommand, PermissionLevel, ToolMetadata } from "@lib";
import ms from "ms";

import type { Message } from "discord.js";

@command("chop", {
  aliases: [ "chop" ],
  description: {
    content: "Chops trees.",
    examples: (prefix: string) => [ `${prefix}chop` ],
    usage: ""
  }
})
export default class ChopCommand extends MandrocCommand {
  public async exec(message: Message) {
    const profile = await message.member?.getProfile()!;

    /* check if the user has an axe. */
    const axe = await Database.PRISMA.inventoryItem.findFirst({
      where: {
        profileId: profile.id,
        item: {
          metadata: {
            equals: {
              type: "axe"
            }
          }
        }
      }
    });

    if (!axe || !(axe.metadata as ToolMetadata).durability) {
      const embed = Embed.Warning("You must possess an **axe** to run this command.");
      return message.util?.send(embed);
    }

    /* check for cool-down. */
    if (profile.lastChopped) {
      const remaining = Date.now() - profile.lastChopped;
      if (ms("25m") > remaining) {
        const rem = ms(remaining, { long: true });
        const embed = Embed.Warning(`Woah! it was only **${rem}** before your last chop session, it's good to take a nice \`25 minute\` break between each session :)`);
        return message.util?.send(embed);
      }
    }

    const logs = [ "oak", "birch", "apple", "pine" ].shuffle(),
      logAmounts = [ ...Array(10).keys() ].slice(1).shuffle(),
      chance = message.member?.permissionLevel === PermissionLevel.Donor ? 0.4 : 0.2;

    profile.lastChopped = Date.now();
    if (Math.random() <= chance) {
      const earned = logAmounts.reduce((acc, x) => acc + x * 8, 0),
        chopped = logs.map((x, i) => `*${logAmounts[i]} ${x} logs*`).join(", ");

      /* send embed */
      const embed = Embed.Success(`Wow! You got ${chopped}, and earned **${earned * 8} ₪**`);
      message.util?.send(embed);

      /* update pocket */
      profile.pocket += earned;
    } else {
      const embed = Embed.Warning("Yikes. The forest you went to burnt down, and it's too late to go to another.");
      message.util?.send(embed);
    }


    /* update profile */
    await Database.PRISMA.profile.update({
      where: { id: profile.id },
      data: {}
    });
  }
}
