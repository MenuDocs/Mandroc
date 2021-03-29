/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { command, Embed, MandrocCommand, Profile } from "@lib";

import type { Message } from "discord.js";

@command("numberguesser", {
  aliases: ["numberguesser"],
  description: {
    content: "Guess a number between `x` and `y`.",
    examples: (prefix: string) => [`${prefix}numberguesser`],
    usage: "!inventory",
  },
})
export default class NumberGuesserCommand extends MandrocCommand {
  public async exec(message: Message) {
    const profile = await Profile.findOneOrCreate({
      where: { _id: message.author.id },
      create: { _id: message.author.id },
    });

    const range = [...Array(500).keys()];
    const low = range.splice(0, 250).random();
    const high = range.splice(250).random();

    const num = [...Array(high).keys()].splice(low).random();

    let failAttempts = 0;
    while (1) {
      const filter = (m: Message) =>
        m.author.id === message.author.id &&
        m.channel.id === message.channel.id;

      const collector = message.channel.createMessageCollector(filter, {
        time: 20000,
      });

      collector.on("collect", (msg: Message) => {
        const answer = +msg.content.split(/ +/g)[0];

        if (failAttempts === 25) {
          return message.channel.send("You used all 25 attempts.");
        }

        if (isNaN(answer) || answer < 0 || answer > 500) {
          failAttempts++;
          message.channel.send(
            `Please provide a number between \`0\`-\`500\``
          );
        } else {
          if (answer == num) {
            profile.pocket += num;
            profile.save();
            return message.util?.send(
              Embed.Primary(
                `Correct! You wont the amount you guessed :wink: **${num} ₪** have been added to your account!`
              )
            );
          }

          if (answer < num) {
            message.util?.send("The number is lower than that!");
          } else {
            message.util?.send("The number is higher than that!");
          }
        }
      });
    }
  }
}
