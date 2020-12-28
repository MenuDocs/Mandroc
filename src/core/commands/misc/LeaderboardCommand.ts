/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { Color, command, MandrocCommand, Profile } from "@lib";
import { Message, MessageEmbed } from "discord.js";

@command("leaderboard", {
  aliases: ["leaderboard", "top"],
  description: {
    content: "Displays bot info",
    examples: (prefix: string) => [`${prefix}leaderboard`],
  },
  args: [
    {
      id: "page",
      match: "option",
      type: "number",
      prompt: {
        retry: "Please provide a valid page number",
      },
    },
  ],
})
export default class AvatarCommand extends MandrocCommand {
  public async exec(message: Message, { page }: args) {
    const profiles = await Profile.find({
      order: { xp: "DESC" },
    });

    const embed = new MessageEmbed()
      .setColor(Color.PRIMARY)
      .setFooter("You can change the page doing: !top <page>");

    let embedDesc = "";
    let i = 0;

    if (!page) {
      for (const profile of profiles.slice(0, 9)) {
        embedDesc += `**${i + 1}. ${
          (await this.client.users.fetch(<string>(<unknown>profile._id))).tag
        } | Level ${profile.level}**`;
        embedDesc += `\u3000 **Exp:** ${profile.xp}`;
      }
      embed.setDescription(embedDesc);
      message.util?.send(embed);
    } else {
      for (const profile of profiles.slice(page * 9, 9 + page * 9)) {
        embedDesc += `**${i + 1}. ${
          (await this.client.users.fetch(<string>(<unknown>profile._id))).tag
        } | Level ${profile.level}**`;
        embedDesc += `\u3000 **Exp:** ${profile.xp}`;
      }

      embed.setDescription(embedDesc);
      message.util?.send(embed);
    }
  }
}

type args = {
  page?: number;
};
