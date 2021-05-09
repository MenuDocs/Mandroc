import ms from "ms";
import { command, Database, Embed, MandrocCommand, ToolMetadata, ToolType } from "@lib";

import type { Message } from "discord.js";
import type { ItemTier, Item } from "./FishCommand";

@command("shovel", {
  aliases: [ "shovel" ],
  description: {
    content: "Shovels after goods in the ground.",
    examples: (prefix: string) => [ `${prefix}shovel` ],
    usage: ""
  }
})
export default class ShovelCommand extends MandrocCommand {
  private items: Array<Item> = [
    {
      name: "Lilly",
      value: 60,
      tier: "basic"
    },
    {
      name: "Dirt",
      value: 2,
      tier: "basic"
    },
    {
      name: "Dropped iPhone",
      value: 2000,
      tier: "exotic"
    }
  ];

  private itemTiers: ItemTier[] = [ "basic", "common", "rare", "exotic" ];
  private chances: number[][] = [
    [ 0, 40 ],
    [ 41, 71 ],
    [ 72, 94 ],
    [ 95, 100 ]
  ];

  async exec(message: Message) {
    const [ shovel, updateShovel ] = await Database.useTool(message.author.id, ToolType.SHOVEL);
    if (!shovel) {
      const embed = Embed.warning("You must possess a shovel in order to run this command.")
      return message.util?.send(embed);
    }

    /* check if the user is on a cool-down. */
    const [profile, updateProfile] = await message.member?.useProfile()!;
    if (profile.lastShoveled && profile.lastShoveled < Date.now() + ms("25m")) {
      const embed = Embed.warning("You can only dig every **25 minutes**.");
      return message.util?.send(embed);
    }

    /* decrement shovel durability */
    await updateShovel({
      metadata: {
        durability: (shovel.metadata as ToolMetadata).durability - 1
      }
    });

    /* update last dug */
    await updateProfile({
      lastShoveled: Date.now()
    });

    if (Math.floor(Math.random() * 100) <= 33) {
      const embed = Embed.warning("Oh no, you didn't find anything.")
      return message.util?.send(embed);
    }

    let i = 0, gain = 0;

    const roll = Math.floor(Math.random() * 100);
    for (const [low, high] of this.chances) {
      if (roll <= low && roll >= high) {
        const grantedItem = this.items
          .filter(x => x.tier === this.itemTiers[i])
          .random();

        /* send caught message. */
        const embed = Embed.primary(`Wow, you dug up a ${grantedItem.name}, it's value of **${grantedItem.value} ₪** has been added to your pocket.`)
        message.util?.send(embed);

        /* add caught item to the overall gain. */
        gain += grantedItem.value;
      }

      i++;
    }

    /* add the gained currency to the author's pocket */
    await updateProfile({
      pocket: {
        increment: gain
      }
    });
  }
}
