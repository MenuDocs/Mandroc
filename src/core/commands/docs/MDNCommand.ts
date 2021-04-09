import { Color, command, Embed, MandrocCommand, MDN } from "@lib";
import { Message, MessageEmbed } from "discord.js";

@command("mdn", {
  aliases: ["js", "mdn"],
  description: {
    content:
      "Allows members to search the MDN web documentation.\nMake sure to be specific or the requested document wont be found.",
    examples: (prefix: string) => [
      `${prefix}js String.prototype.split()`,
      `${prefix}mdn Array.isArray()`,
    ],
    usage: "<query>",
  },
  args: [
    {
      id: "docs",
      prompt: {
        start: "Please give me a query for searching MDN",
        retry: "Please try again.",
      },
      match: "rest",
      type: (_, p) => p ? MDN.search(p) : null,
    },
    {
      id: "first",
      match: "flag",
      flag: ["-f", "--first"],
    },
  ],
})
export default class MDNCommand extends MandrocCommand {
  static makeMdnLink(slug: string) {
    return `https://developer.mozilla.org/en-US/docs/${slug.replace(
      /^\//m,
      ""
    )}`;
  }

  async exec(message: Message, { docs }: args) {
    const match = docs[0].diff === 1

    if (!match) {
      let str = "",
        idx = 0;

      for (const doc of docs) {
        const link = MDNCommand.makeMdnLink(doc.slug);
        str += `\`#${`${++idx}`.padStart(2, "0")}\` **[${doc.title}](${link})**\n`;
      }

      const embed = Embed.Primary()
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
        .setDescription(str);

      return message.util?.send(embed);
    }

    const doc = docs[0],
      embed = new MessageEmbed()
        .setColor(Color.Primary)
        .setTitle(doc.title)
        .setURL(MDNCommand.makeMdnLink(doc.slug))
        .setDescription(this.client.turndown.turndown(doc.summary));

    return message.util?.send(embed);
  }
}

type args = {
  docs: MDN.DocumentWithDifference[];
  first: boolean;
};
