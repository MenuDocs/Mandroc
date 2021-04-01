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
      num = Number.random(0, 500);

    const filter = (m: Message) => m.author.id === message.author.id
      && m.channel.id === message.channel.id
      && /^\d+$/m.test(m.content);

    let attempts = 0;
    async function prompt(): Promise<boolean> {
      const guesses = await message.channel.awaitMessages(filter, {
        time: 20000,
        max: 1,
      });

      if (guesses.size === 0) {
        message.util?.send(Embed.Primary("Seems that you forgot to answer... cancelling."));
        return false;
      }

      const guess = +guesses.first()!.content;
      if (guess === num) {
        profile.pocket += num;

        const embed = Embed.Success(`Correct! Want the amount you guessed :wink: **${num} ₪** has been added to your account!`);
        await Promise.all([ profile.save(), message.util?.send(embed) ]);

        return false;
      }

      const embed = Embed.Warning(`The number is **${num > guess ? "higher" : "lower"}** than that!`);
      await guesses.first()?.delete();
      await message.util?.send(embed);

      return true;
    }

    await message.channel.send(Embed.Primary("Guess a number between **0** and **500**"));
    while (attempts !== 10) {
      const cont = await prompt();
      if (!cont) {
        return;
      }

      attempts++;
    }

    return message.util?.send(`Oh no, you've used all 25 of your attempts!\nThe number was **${num}**`);
  }
}
