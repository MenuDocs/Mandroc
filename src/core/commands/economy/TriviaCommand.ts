import { Color, command, MandrocCommand } from "@lib";
import type { Message } from "discord.js";
import { MessageEmbed } from "discord.js";
import fetch from "node-fetch";
//import { MessageEmbed } from "discord.js";

@command("rob", {
  aliases: ["rob", "steal"],
  description: {
    content: "Robs money from a user.",
    examples: (prefix: string) => [`${prefix}trivia @R1zeN#0001`],
    usage: "<user>",
  },
  args: [
    {
      id: "toRob",
      type: "user",
      prompt: {
        start: "Please give me a user to rob.",
        retry: "Please provide a user ... Example: `!rob @R1zeN#0001`",
      },
    },
  ],
})
export default class TriviaCommand extends MandrocCommand {
  async exec(message: Message) {
    const triviaObj = (
      await fetch("https://opentdb.com/api.php?amount=1&type=multiple").then((r) => r.json())
    ).results[0];

    const { correct_answer } = triviaObj;

    const embed = new MessageEmbed()
      .setColor(Color.Primary)
      .setFooter("You have 10 seconds to answer this question.");

    const shuffledArr = (array: Array<any>) =>
      array.sort(() => 0.5 - Math.random());

    const possibleAnswers = shuffledArr([correct_answer, ...triviaObj.incorrect_answers]);

    embed.setTitle("Multiple Choice").addField(
      triviaObj.question,
      possibleAnswers.map(
        (opt, i) => {
          `\u3000**${i}. ${opt}**\n`;
        }
      )
    );

    message.channel.send(embed);

    const filter = (m: Message) =>
      m.author.id === message.author.id && m.channel.id === message.channel.id;

    message.channel
      .awaitMessages(filter, { max: 1, time: 10000, errors: ["time"] })
      .then((collected) => {
        const answer = +collected.array()[0].content.toLowerCase();
        if (answer - 1 === possibleAnswers.indexOf(correct_answer)) {
          message.channel.send("**Correct!** You won 25₪");
        }
      })
      .catch((_) => message.channel.send("You took too long."));
  }
}
