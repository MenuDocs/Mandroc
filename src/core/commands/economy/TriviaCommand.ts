import { command, Database, Embed, MandrocCommand, Trivia } from "@lib";

import type { Message } from "discord.js";

@command("trivia", {
  aliases: [ "trivia", "quiz" ],
  description: {
    content: "Robs money from a user.",
    examples: (prefix: string) => [ `${prefix}trivia @R1zeN#0001` ],
    usage: "<user>"
  }
})
export default class TriviaCommand extends MandrocCommand {
  async exec(message: Message) {
    const trivia = await Trivia.multipleChoice();

    /* send message */
    const answers = trivia.possibleAnswers.map(
      (ans, idx) => `\`#${`${idx + 1}`.padStart(2, "0")}\` ${ans}`
    );

    message.util?.send(
      Embed.Primary()
        .setFooter("You have 10 seconds to answer this question.")
        .setTitle("Multiple Choice")
        .setDescription(this.client.turndown.turndown(trivia.question))
        .addField("\u200e", answers.join("\n"))
    );

    /* create message collector. */
    const collector = message.channel.createMessageCollector(
      this.getFilter(message, trivia),
      {
        time: 1e4 /* 10 seconds */
      }
    );

    // handle messages
    collector.on("collect", (message: Message) => {
      if (/^cancel$/im.test(message.content)) {
        collector.stop("cancel");
        return;
      }

      const answer = +message.content;
      if (trivia.answer === trivia.possibleAnswers[answer - 1]) {
        collector.stop("correct");
        return;
      }
    });

    // handle stop
    collector.on("end", async (_, reason) => {
      const earned = Number.random(15, 45);
      switch (reason) {
        case "correct":
          await message.util?.send(Embed.Primary(`Congrats! You earned **${earned} ₪**`));

          /* add earned amount to the author's pocket */
          await Database.PRISMA.profile.upsert({
            where: { id: message.author.id },
            create: {
              id: message.author.id,
              pocket: earned
            },
            update: {
              pocket: {
                increment: earned
              }
            }
          });

          break;

        case "cancel":
          message.util?.send(
            Embed.Primary(
              `Oh okay, I cancelled the trivia. You missed out on **${earned} ₪**`
            )
          );
          break;

        case "time":
          message.util?.send(
            Embed.Primary(
              `Oh no! You ran out of time. You missed out on **${earned} ₪**`
            )
          );
          break;
      }
    });
  }

  getFilter(
    message: Message,
    trivia: Trivia.MultipleChoiceTrivia
  ): (m: Message) => boolean {
    const regex = new RegExp(
      `^(cancel|[1-${trivia.possibleAnswers.length}])$`,
      "im"
    );

    return (m: Message) =>
      regex.test(m.content) && m.author.id === message.author.id;
  }
}
