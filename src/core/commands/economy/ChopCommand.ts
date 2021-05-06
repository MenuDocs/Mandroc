import { command, Database, Embed, MandrocCommand, PermissionLevel, ToolMetadata, ToolType } from "@lib";
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
    /* check if the user has an axe. */
    const [ axe, updateAxe ] = await Database.useTool(message.author.id, ToolType.AXE);
    if (!axe || !(axe.metadata as ToolMetadata).durability) {
      const embed = Embed.Warning("You must possess an **axe** to run this command.");
      return message.util?.send(embed);
    }

    /* check for cool-down. */
    const [ profile, updateProfile ] = await message.member?.useProfile()!;
    if (profile.lastChopped) {
      const remaining = Date.now() - profile.lastChopped;
      if (ms("25m") > remaining) {
        const rem = ms(remaining, { long: true });
        const embed = Embed.Warning(`Woah! it was only **${rem}** before your last chop session, it's good to take a nice \`25 minute\` break between each session :)`);
        return message.util?.send(embed);
      }
    }

    /* update axe durability */
    await updateAxe({
      metadata: {
        durability: (axe.metadata as ToolMetadata).durability - 1
      }
    });

    const logs = [ "oak", "birch", "apple", "pine" ].shuffle(),
      logAmounts = [ ...Array(10).keys() ].slice(1).shuffle(),
      chance = message.member?.permissionLevel === PermissionLevel.Donor ? 0.4 : 0.2;

    let gain = 0;
    if (Math.random() <= chance) {
      gain = logAmounts.reduce((acc, x) => acc + x * 8, 0);

      /* send embed */
      const chopped = logs.map((x, i) => `*${logAmounts[i]} ${x} logs*`).join(", ");
      message.util?.send(Embed.Success(`Wow! You got ${chopped}, and earned **${gain} ₪**`));

      /* update pocket */
    } else {
      const embed = Embed.Warning("Yikes. The forest you went to burnt down, and it's too late to go to another.");
      message.util?.send(embed);
    }

    /* update author's last chopped timestamp */
    await updateProfile({
      lastChopped: Date.now(),
      pocket: {
        increment: gain
      }
    });
  }
}
