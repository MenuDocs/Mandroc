import { command, Embed, MandrocCommand } from "@lib";

import type { GuildMember, Message } from "discord.js";

@command("pay", {
  aliases: ["pay"],
  channel: "guild",
  description: {
    content: "Pays money to a user.",
    examples: (prefix: string) => [
      `${prefix}pay @R1zeN#0001 60`,
      `${prefix}pay @duncte123#1245 80`,
      `${prefix}pay T3NED#0001 2`
    ],
    usage: "<package>"
  },
  args: [
    {
      id: "receiver",
      type: "member",
      prompt: {
        start: "Please give me a user to transfer to.",
        retry: "Please provide a user ... Example: `!pay @R1zeN#0001 50`"
      }
    },
    {
      id: "amount",
      type: "number",
      match: "rest",
      prompt: {
        start: "Please provide an amount to transfer to that user!",
        retry: "Please try again ... Example: ``!pay @R1zeN#0001 50"
      }
    }
  ]
})
export default class PayCommand extends MandrocCommand {
  async exec(message: Message, { receiver, amount }: args) {
    const payer = await message.member!.getProfile();
    if (payer.pocket < amount) {
      const embed = Embed.Warning(
        "You don't have enough money in your pocket."
      );
      return message.util?.send(embed);
    }

    const receiverProfile = await receiver.getProfile();
    receiverProfile.pocket += amount;
    payer.pocket -= amount;

    await message.util?.send(
      Embed.Primary(`Successfully payed **${amount} ₪** to ${receiver}`)
    );
    await Promise.all([receiverProfile, payer].map(p => p.save()));
  }
}

type args = {
  receiver: GuildMember;
  amount: number;
};
