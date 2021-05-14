import ms from "ms";
import { command, Database, Embed, MandrocCommand, ToolMetadata } from "@lib";

import type { Message } from "discord.js";

@command("mine", {
  aliases: [ "mine" ],
  description: {
    content: "Shovels after goods in the ground.",
    examples: (prefix: string) => [ `${prefix}shovel` ],
    usage: ""
  }
})
export default class MineCommand extends MandrocCommand {
  private items: Array<MinedResource> = [
    {
      name: "Diamond",
      price: 400,
      tier: "exotic"
    },
    {
      name: "Emerald",
      price: 260,
      tier: "rare"
    },
    {
      name: "Sapphire",
      price: 288,
      tier: "rare"
    },
    {
      name: "Stone",
      price: 8,
      tier: "basic"
    },
    {
      name: "Cobblestone",
      price: 50,
      tier: "common"
    }
  ];

  private itemTiers: Tier[] = [ "basic", "common", "rare", "exotic" ];
  private chances: number[][] = [
    [ 0, 40 ],
    [ 41, 71 ],
    [ 72, 94 ],
    [ 95, 100 ]
  ];

  public async exec(message: Message) {
    const pickaxe = await Database.PRISMA.inventoryItem.findFirst({
      where: {
        profileId: message.author.id,
        item: {
          type: "Tool",
          metadata: {
            equals: {
              type: "pickaxe"
            }
          }
        }
      },
      select: {
        id: true,
        metadata: true
      }
    });

    if (!pickaxe) {
      const embed = Embed.warning("You must possess a **pickaxe** in order to run this command.");
      return message.util?.send(embed);
    }

    const profile = await message.member!.getProfile();
    if (profile.lastMined && profile.lastMined < Date.now() + ms("25m")) {
      const embed = Embed.warning("You can only access this command every 25 minutes.");
      return message.util?.send(embed);
    }

    /* decrement pickaxe durability and author's last mined. */
    await Database.PRISMA.inventoryItem.update({
      where: { id: pickaxe.id },
      data: {
        metadata: {
          durability: (pickaxe.metadata as ToolMetadata).durability - 1
        }
      }
    });

    await Database.PRISMA.profile.update({
      where: { id: message.author.id },
      data: {
        lastMined: Date.now()
      }
    });

    if (Math.floor(Math.random() * 100) <= 33) {
      const embed = Embed.warning("You didn't find anything in the mine.");
      return message.util?.send(embed);
    }

    let gainedCurrency = 0;

    const roll = Math.floor(Math.random() * 100);
    for (const idx in this.chances) {
      const [ low, high ] = this.chances[idx];
      if (roll <= low && roll >= high) {
        const resource = this.items
          .filter(x => x.tier === this.itemTiers[idx])
          .random();

        const embed = Embed.primary(`Wow, you mined a ${resource.name}, it's value of \`${resource.price} ₪\` has been added to your pocket.`);
        message.util?.send(embed);

        /* add resource value to overall gain. */
        gainedCurrency += resource.price;
      }
    }

    /* add gained currency to the author's pocket */
    await Database.PRISMA.profile.update({
      where: { id: message.author.id },
      data: {
        pocket: {
          increment: gainedCurrency
        }
      }
    });
  }
}

type Tier = "basic" | "common" | "rare" | "exotic";

interface MinedResource {
  name: string;
  price: number;
  tier: Tier;
}
