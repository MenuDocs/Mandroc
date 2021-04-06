import { command, Embed, MandrocCommand } from "@lib";

import type { Message } from "discord.js";

@command("coinflip", {
  aliases: ["coinflip"],
  description: {
    content: "Flips a coin - test your luck :wink:.",
    examples: (prefix: string) => [`${prefix}coinflip tails 200`],
    usage: "<user>",
  },
  args: [
    {
      id: "side",
      type: ["heads", "tails"],
      prompt: {
        start: "Please tell me which side you bet on.",
        retry:
          "Please try again... Example: `!coinflip <heads|tails> <amount>`",
      },
    },
    {
      id: "bet",
      match: "rest",
      prompt: {
        start: "Please tell me how much you wish to bet",
        retry: "Please try again... Example: `!coinflip <heads|tails> <amount>`",
      },
    },
  ],
})
export default class CoinflipCommand extends MandrocCommand {
  async exec(message: Message, { side, bet }: args) {
    const profile = await message.member!.getProfile()
    if (bet > profile.pocket) {
      return message.util?.send("You cant bet more than you have in your pocket!");
    }

    const landed = ["tails", "heads"].random();
    if (side === landed) {
      const amount = Math.round(bet / 3)
      profile.pocket += amount;
      message.util?.send(Embed.Success(`Wow! It was \`${side}\` indeed! *You received:* **${amount} ₪**`));
    } else {
      profile.pocket -= bet;
      const embed = Embed.Warning(`Darn it ... it was \`${side}\`. *You lost:* **${bet} ₪**`);
      message.util?.send(embed);
    }

    return profile.save();
  }
}

type args = {
  side: string;
  bet: number;
};
