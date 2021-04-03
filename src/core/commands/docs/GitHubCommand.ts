import { Color, command, MandrocCommand } from "@lib";
import fetch from "node-fetch";
import { Message, MessageEmbed } from "discord.js";

@command("github", {
  aliases: ["gh", "github"],
  description: {
    content: "Displays a GitHub user's profile information.",
    examples: (prefix: string) => [
      `${prefix}github MeLike2D`,
      `${prefix}gh torvalds`,
      `${prefix}gh JonasSchiott`,
    ],
    usage: "<username>",
  },
  args: [
    {
      id: "username",
      match: "rest",
      prompt: {
        start: "Please give me username to query GitHub with.",
        retry: "Please try again... Example: `gh MenuDocs`",
      },
    },
  ],
})
export default class GitHubCommand extends MandrocCommand {
  public async exec(message: Message, { username }: args) {
    const res = await fetch(
      `https://api.github.com/users/${username}`
    ).then((r) => r.json());

    if (res.message) {
      return message.util?.send(
        new MessageEmbed()
          .setDescription(`Sorry, I couldn't find anything for \`${username}\``)
          .setColor(Color.WARNING)
      );
    }

    return message.util?.send(
      new MessageEmbed()
        .setColor(Color.PRIMARY)
        .setDescription(["**Description**", res.bio])
        .setThumbnail(res.avatar_url)
        .setURL(res.html_url)
        .addField(
          "User Info",
          [
            `**❯ Real name:** ${res.name || "None"}`,
            `**❯ Location:** ${res.location || "None"}`,
            `**❯ GitHub ID:** ${res.id}`,
            `**❯ Website:** ${res.blog || "None"}`,
          ],
          true
        )
        .addField(
          "Social stats",
          [
            `**❯ Followers:** ${res.followers}`,
            `**❯ Following:** ${res.following}`,
          ],
          true
        )
    );
  }
}

type args = {
  username: string;
};
