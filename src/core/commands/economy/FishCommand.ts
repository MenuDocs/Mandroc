import { command, Database, Embed, MandrocCommand, ToolMetadata, ToolType } from "@lib";
import ms from "ms";

import type { Message } from "discord.js";

@command("fish", {
  aliases: [ "fish" ],
  description: {
    content: "Fish after goods in the sea.",
    examples: (prefix: string) => [ `${prefix}fish` ],
    usage: ""
  }
})
export default class FishCommand extends MandrocCommand {
  private items: Array<Item> = [
    {
      name: "Worn Boot",
      value: 60,
      tier: "basic"
    },
    {
      name: "Baby Shark",
      value: 200,
      tier: "rare"
    }
  ];

  private itemTiers: ItemTier[] = [ "basic", "common", "rare", "exotic" ];
  private chances: number[][] = [
    [ 0, 40 ],
    [ 41, 71 ],
    [ 72, 94 ],
    [ 95, 100 ]
  ];

  public async exec(message: Message) {
    const [ fishingRod, updateFishingRod ] = await Database.useTool(message.author.id, ToolType.FISHING_ROD);
    if (!fishingRod) {
      const embed = Embed.Warning("You must possess a **fishing rod** in order to run this command.");
      return message.util?.send(embed);
    }

    const [ profile, updateProfile ] = await message.member?.useProfile()!;
    if (profile.lastFished && profile.lastFished < Date.now() + ms("25m")) {
      const embed = Embed.Warning("You can only access this command every 25 minutes.");
      return message.util?.send(embed);
    }

    /* decrement fishing rod durability */
    await updateFishingRod({
      metadata: {
        durability: (fishingRod.metadata as ToolMetadata).durability + 1
      }
    });

    /* update last fished. */
    await updateProfile({ lastFished: Date.now() }, false);

    if (Math.floor(Math.random() * 100) <= 33) {
      await updateProfile()
      const embed = Embed.Warning("Oh no, you didn't catch anything..");
      return message.util?.send(embed);
    }

    let i = 0, gain = 0;

    const roll = Math.floor(Math.random() * 100);
    for (const [ low, high ] of this.chances) {
      if (roll <= low && roll >= high) {
        const caughtItem = this.items
          .filter(x => x.tier === this.itemTiers[i])
          .random();

        /* send caught message. */
        const embed = Embed.Primary(`Wow, you caught a ${caughtItem.name}, it's value of \`${caughtItem.value}₪\` has been added to your pocket.`);
        message.util?.send(embed);

        /* add caught item to the overall gain */
        gain += caughtItem.value;
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

export type ItemTier = "common" | "basic" | "rare" | "exotic";

export interface Item {
  tier: ItemTier;
  name: string;
  value: number;
}
