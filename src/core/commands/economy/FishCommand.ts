import { command, Embed, Item, ToolTier, MandrocCommand } from "@lib";
import ms from "ms";

import type { Message } from "discord.js";

@command("fish", {
  aliases: ["fish"],
  description: {
    content: "Fishes after goods in the sea.",
    examples: (prefix: string) => [`${prefix}fish`],
    usage: ""
  }
})
export default class FishCommand extends MandrocCommand {
  private items: Array<Item> = [
    {
      name: "Worn Boot",
      price: 60,
      tier: "basic"
    },
    {
      name: "Baby Shark",
      price: 200,
      tier: "rare"
    }
  ];

  private itemTiers: ToolTier[] = ["basic", "common", "rare", "exotic"];
  private chances: number[][] = [
    [0, 40],
    [41, 71],
    [72, 94],
    [95, 100]
  ];

  public async exec(message: Message) {
    const profile = await message.member!.getProfile(),
      roll = Math.floor(Math.random() * 100),
      embed = Embed.Primary();

    if (!profile.inventory.find(x => x.name == "Fishing Rod")) {
      embed.setDescription(
        "You must possess a fishing rod in order to run this command."
      );
      return message.util?.send(embed);
    }

    if (profile.lastFished && profile.lastFished < Date.now() + ms("25m")) {
      return message.util?.send(
        Embed.Warning("You can only access this command every 25 minutes.")
      );
    }

    profile.inventory.find(x => x.name === "Fishing Rod")!.durability -= 1;

    if (Math.floor(Math.random() * 100) <= 33) {
      await profile.save();
      return message.util?.send("Your fishing rod didn't catch anything.");
    }

    let i = 0;

    for (const entry of this.chances) {
      const [low, high] = entry;

      if (roll <= low && roll >= high) {
        const grantedItem = this.items
          .filter(x => x.tier === this.itemTiers[i])
          .random();

        embed.setDescription(
          `Wow, you caught a ${grantedItem.name}, it's value of \`${grantedItem.price}₪\` has been added to your pocket.`
        );
        profile.pocket += grantedItem.price;
        message.util?.send(embed);
      }
      i++;
    }

    await profile.save();
  }
}
