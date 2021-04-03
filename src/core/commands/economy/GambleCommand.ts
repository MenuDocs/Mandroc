import { command, Embed, MandrocCommand } from "@lib";

import type { Message } from "discord.js";

@command("gamble", {
  aliases: [ "gamble" ],
  description: {
    content: "Guess a number between `x` and `y`.",
    examples: (prefix: string) => [ `${prefix}gamble 500` ],
    usage: "!gamble <amount>",
  },
  args: [
    {
      id: "amount",
      match: "rest",
      prompt: {
        start: "Please give me an amount to gamble.",
        retry: "Please try again... Example: `!gamble 100`",
      },
    },
  ],
})
export default class NumberGuesserCommand extends MandrocCommand {
  public async exec(message: Message, { amount }: args) {
    const profile = await message.member!.getProfile();
    if (amount <= 0) {
      return message.channel.send(
        Embed.Warning("You must provide a valid number!"),
      );
    }

    if (amount > profile.pocket) {
      return message.channel.send(
        Embed.Warning("You may not gamble more than you have in your pocket!"),
      );
    }

    const chances = [ false, false, false, true ];
    if (message.member?.permissionLevel !== 1) {
      chances.push(true);
    }

    if (chances.random()) {
      profile.pocket += amount / 2;
      message.channel.send(Embed.Primary(`You won **${amount / 2} ₪**`));
    } else {
      profile.pocket -= amount;
      message.channel.send(Embed.Warning(`You lost **${amount} ₪**`));
    }

    await profile.save();
  }
}

type args = {
  amount: number;
};
