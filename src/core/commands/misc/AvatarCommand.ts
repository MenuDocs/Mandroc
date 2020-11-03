/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { Color, command, imageUrlOptions, MandrocCommand } from "@lib";
import { Message, MessageEmbed, User } from "discord.js";

@command("avatar", {
  aliases: ["avatar", "ava", "pfp"],
  description: {
    content: "Displays the avatar of a user",
    usage: "[user]",
    examples: (prefix: string) => [`${prefix}avatar`, `${prefix}avatar @2D`],
  },
  args: [
    {
      id: "user",
      type: "user",
      default: (m: Message) => m.author,
    },
  ],
})
export default class AvatarCommand extends MandrocCommand {
  public exec(message: Message, { user }: args) {
    const url = user.displayAvatarURL(imageUrlOptions),
      embed = new MessageEmbed()
        .setTitle(`Avatar for ${user.tag}`)
        .setURL(url)
        .setColor(Color.Primary)
        .setImage(url);

    return message.util?.send(embed);
  }
}

type args = {
  user: User;
};
