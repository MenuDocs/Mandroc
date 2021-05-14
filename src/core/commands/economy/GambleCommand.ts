import { command, Database, Embed, MandrocCommand, PermissionLevel } from "@lib";

import type { Message } from "discord.js";

@command("gamble", {
  aliases: [ "gamble" ],
  description: {
    content: "Guess a number between `x` and `y`.",
    examples: (prefix: string) => [ `${prefix}gamble 500` ],
    usage: "!gamble <amount>"
  },
  args: [
    {
      id: "amount",
      match: "rest",
      prompt: {
        start: "Please give me an amount to gamble.",
        retry: "Please try again... Example: `!gamble 100`"
      }
    }
  ]
})
export default class GambleCommand extends MandrocCommand {
  public async exec(message: Message, { amount }: args) {
    const profile = await message.member!.getProfile();
    if (amount <= 0) {
      const embed = Embed.warning(`${amount < 0 ? "**Negative numbers** aren't" : "**Zero** isn't"} a valid amount!`);
      return message.util?.send(embed);
    }

    if (amount > profile.pocket) {
      const embed = Embed.warning("You may not gamble more than you have in your pocket!");
      return message.util?.send(embed);
    }

    const chances = message.member?.permissionLevel === PermissionLevel.Donor
      ? .50
      : .25;

    let pocket = profile.pocket;
    if (Math.random() <= chances) {
      pocket += amount / 2;
      message.util?.send(Embed.primary(`You won **${amount / 2} ₪**`));
    } else {
      pocket -= amount;
      message.util?.send(Embed.warning(`You lost **${amount} ₪**`));
    }

    /* update profile column */
    await Database.PRISMA.profile.update({
      where: { id: profile.id },
      data: { pocket }
    });
  }
}

type args = {
  amount: number;
};
