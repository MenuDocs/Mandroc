/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { Color, command, MandrocCommand, Profile } from "@lib";
import { Message, MessageEmbed, User } from "discord.js";

@command("pay", {
  aliases: ["pay"],
  description: {
    content: "Pays money to a user.",
    examples: (prefix: string) => [
      `${prefix}pay @R1zeN#0001 60`,
      `${prefix}pay @duncte123#1245 80`,
      `${prefix}pay T3NED#0001 2`,
    ],
    usage: "<package>",
  },
  args: [
    {
      id: "receiver",
      type: "user",
      prompt: {
        start: "Please give me a user to transfer to.",
        retry: "Please provide a user ... Example: `!pay @R1zeN#0001 50`",
      },
    },
    {
      id: "amount",
      type: "number",
      match: "rest",
      prompt: {
        start: "Please provide an amount to transfer to that user!",
        retry: "Please try again ... Example: ``!pay @R1zeN#0001 50",
      },
    },
  ],
})
export default class PayCommand extends MandrocCommand {
  public async exec(message: Message, { receiver, amount }: args) {
    const author = message.author;
    const authorProfile =
      (await Profile.findOne({ _id: author.id })) ??
      (await Profile.create({ _id: author.id }));
    const receiverProfile =
      (await Profile.findOne({ _id: receiver.id })) ??
      (await Profile.create({ _id: receiver.id }));

    const embed = new MessageEmbed();

    if (amount > authorProfile.pocket) {
      embed
        .setColor(Color.Warning)
        .setDescription("You do not have this much money in your pocket!")
        .setFooter(
          "If you have money in your bank, transfer it to your pocket."
        );

      return message.channel.send(embed);
    }

    // Remove money from author pocket.
    authorProfile.pocket -= amount;
    await authorProfile.save();

    // Add money to receiver.
    receiverProfile.pocket += amount;
    await receiverProfile?.save();

    embed
      .setColor(Color.Success)
      .setDescription(`Successfully paid ${receiver}₪!`);

    message.channel.send(embed);
  }
}

type args = {
  receiver: User;
  amount: number;
};
