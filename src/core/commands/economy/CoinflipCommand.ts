/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { command, Embed, MandrocCommand, Profile } from "@lib";

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
      match: "rest",
      prompt: {
        start: "Please tell me which side you bet on.",
        retry:
          "Please try again... Example: `!coinflip <heads|tails> <amount>`",
      },
    },
    {
      id: "amount",
      match: "rest",
      prompt: {
        start: "Please tell me how much you wish to bet",
        retry:
          "Please try again... Example: `!coinflip <heads|tails> <amount>`",
      },
    },
  ],
})
export default class CoinflipCommand extends MandrocCommand {
  async exec(message: Message, { side, amount }: args) {
    const profile = await Profile.findOneOrCreate({
      where: { _id: message.author.id },
      create: { _id: message.author.id },
    });

    const flippedSide = ["tails", "heads"].random();

    if (!new RegExp(/(heads)|(tails)/, "gi").exec(side))
      return message.channel.send("Please pick a proper side. `heads|tails`");
    if (amount > profile.pocket) {
      return message.channel.send(
        "You cant bet more than you have in your pocket!"
      );
    }

    if (side === flippedSide) {
      profile.pocket += amount / 3;
      const embed = Embed.Success(
        `Wow! It was \`${side}\` indeed! **You received: ${amount / 3} ₪**`
      );

      message.channel.send(embed);
    } else {
      profile.pocket -= amount;
      const embed = Embed.Success(
        `Darn it ... it was \`${side}\`. **You lost: ${amount} ₪**`
      );

      message.channel.send(embed);
    }

    return profile.save();
  }
}

type args = {
  side: string;
  amount: number;
};
