import { Color, command, MandrocCommand } from "@lib";
import fetch from "node-fetch";
import { Message, MessageEmbed } from "discord.js";

@command("npm", {
  aliases: ["npm"],
  description: {
    content: "Displays a NPM package's information.",
    examples: (prefix: string) => [
      `${prefix}npm react`,
      `${prefix}npm eslint`,
      `${prefix}npm discord.js`,
    ],
    usage: "<package>",
  },
  args: [
    {
      id: "pkg",
      match: "rest",
      prompt: {
        start: "Please give me package name to query NPM with.",
        retry: "Please try again... Example: `npm discord.js`",
      },
    },
  ],
})
export default class GitHubCommand extends MandrocCommand {
  public async exec(message: Message, { pkg }: args) {
    const res = await fetch(`https://registry.npmjs.org/${pkg}`).then((r) =>
      r.json()
    );

    if (res.error) {
      return message.util?.send(
        new MessageEmbed()
          .setDescription(`Sorry, I couldn't find anything for \`${pkg}\``)
          .setColor(Color.WARNING)
      );
    }

    const version = res.versions[res["dist-tags"].latest];

    const embed = new MessageEmbed()
      .setColor(Color.PRIMARY)
      .setThumbnail(
        "https://static.npmjs.com/338e4905a2684ca96e08c7780fc68412.png"
      )
      .setAuthor(
        res.name,
        "https://i.imgur.com/ErKf5Y0.png",
        `https://www.npmjs.com/package/${res._id}`
      )
      .addField("Package Info", [
        `**❯ Author:** ${version.maintainers[0].name || "None"}`,
        `**❯ Repository:** ${res.repository.url || "None"}`,
        `**❯ ${
          version.maintainers.length > 1 ? "Maintainers" : "Maintainer"
        }:** ${version.maintainers
          .map((usr: { name: string }) => usr.name)
          .join(", ")}`,
        `**❯ Latest Version:** ${version.version || "None"}`,
        `**❯ Keywords:** ${res.keywords ? res.keywords.join(", ") : "None"}`,
      ]);

    if (res.description) {
      embed.setDescription(["**Description:**", res.description]);
    }

    message.util?.send(embed);
  }
}

type args = {
  pkg: string;
};
