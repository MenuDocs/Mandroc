/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { command, Embed, MandrocCommand } from "@lib";

import type { Message } from "discord.js";

@command("numberguesser", {
  aliases: [ "numberguesser" ],
  description: {
    content: "Guess a number between `x` and `y`.",
    examples: (prefix: string) => [ `${prefix}numberguesser` ],
    usage: "!inventory",
  },
})
export default class NumberGuesserCommand extends MandrocCommand {
  public async exec(message: Message) {
    const profile = await message.member!.getProfile(),
      range = [ ...Array(500).keys() ];

    const low = range.splice(0, 250).random(),
      high = range.splice(250).random(),
      num = [ ...Array(high).keys() ].splice(low).random();

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
          return message.util?.send(Embed.Warning(`Please provide a number between \`${low}\`, \`${high}\``));
        }

        if (answer == num) {
          const embed = Embed.Primary(`Correct! You wont the amount you guessed :wink: **${num} ₪** have been added to your account!`);

          profile.pocket += num;
          profile.save();
          return message.channel.send(embed);
        }

        if (answer < num) {
          message.util?.send(Embed.Warning("The number is lower than that!"));
        } else {
          message.util?.send(Embed.Warning("The number is higher than that!"));
        }
      });
    }
  }
}
