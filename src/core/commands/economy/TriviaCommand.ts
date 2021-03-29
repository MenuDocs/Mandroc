import { command, Embed, MandrocCommand } from "@lib";
import fetch from "node-fetch";

import type { Message } from "discord.js";

@command("trivia", {
  aliases: [ "trivia", "quiz" ],
  description: {
    content: "Robs money from a user.",
    examples: (prefix: string) => [ `${prefix}trivia @R1zeN#0001` ],
    usage: "<user>",
  },
})
export default class TriviaCommand extends MandrocCommand {
  async exec(message: Message) {
    const { results } = await fetch(
      "https://opentdb.com/api.php?amount=1&type=multiple",
    ).then((r) => r.json());

    const { correct_answer, incorrect_answers, question } = results[0],
      possibleAnswers = [ correct_answer, ...incorrect_answers ].shuffle(),
      embed = Embed.Primary()
        .setFooter("You have 10 seconds to answer this question.")
        .setTitle("Multiple Choice")
        .setDescription(this.client.turndown.turndown(question))
        .addField(
          "\u200E",
          possibleAnswers
            .map((o, i) => `\`${`${i + 1}`.padStart(2, "0")}\` ${o}`)
            .join("\n"),
        );

    message.util?.send(embed);

    const filter = (m: Message) =>
      new RegExp(`^cancel|[1-${possibleAnswers.length}]$`, "im").test(
        m.content,
      ) &&
      m.author.id === message.author.id &&
      m.channel.id === message.channel.id;

    const collector = message.channel.createMessageCollector(filter, {
      time: 15000,
    });

    collector
      .on("collect", (message: Message) => {
        if (/^cancel$/im.test(message.content)) {
          return collector.stop("cancelled");
        }

        const [ _num ] = (new RegExp(`^[1-${possibleAnswers.length}]$`, "m").exec(
          message.content,
          )!),
          num = +_num;

        if (num - 1 === possibleAnswers.indexOf(correct_answer)) {
          return collector.stop("correct");
        }
      })
      .on("end", async (_c, reason) => {
        const earned = Math.floor(Math.random() * (35 - 15) + 15);

        switch (reason) {
          case "correct":
            const profile = await message.member!.getProfile();

            profile.pocket += earned;
            await profile.save();
            await message.util?.send(
              Embed.Primary(`Congrats! You earned **${earned} ₪**`),
            );

            break;
          case "cancelled":
            message.util?.send(
              Embed.Primary(
                `Oh okay, I cancelled the trivia. You missed out on **${earned} ₪**`,
              ),
            );
            break;
          case "time":
            message.util?.send(
              Embed.Primary(
                `Oh no! You ran out of time. You missed out on **${earned} ₪**`,
              ),
            );
            break;
        }
      });
  }
}
