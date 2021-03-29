/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { Color, command, MandrocCommand, PermissionLevel, Profile } from "@lib";
import { Message, MessageEmbed, User } from "discord.js";
import utc from "moment";

@command("userinfo", {
  aliases: ["userinfo", "bal", "balance", "ui"],
  description: {
    content: "Displays a user's info",
    usage: "[user]",
    examples: (prefix: string) => [`${prefix}userinfo`, `${prefix}ui @2D`],
  },
  args: [
    {
      id: "user",
      type: "user",
      default: (m: Message) => m.author,
    },
  ],
})
export default class UserInfoCommand extends MandrocCommand {
  public async exec(message: Message, { user }: args) {
    const profile = await Profile.findOneOrCreate({
      where: { userId: user.id },
      create: { userId: user.id },
    });

    let permissionLevel = null;
    if (message.guild) {
      const member = message.guild.members.cache.get(user.id);
      if (member && member.permissionLevel != null) {
        permissionLevel = PermissionLevel[member.permissionLevel].split("_").map((x: string) => x.capitalize(true)).join(" ");
      }
    }

    const flags =
      (await user.fetchFlags(true))
        .toArray()
        .map((u) =>
          u
            .split("_")
            .map((s) => s.capitalize(true))
            .join(" ")
        )
        .join(", ") || "none";

    const embed = new MessageEmbed()
      .setColor(Color.PRIMARY)
      .setThumbnail(user.displayAvatarURL())
      .addField("User Info", [
        `**❯ Name:** ${user.tag}`,
        `**❯ ID:** ${user.id}`,
        `**❯ Created At:** ${utc(user.createdTimestamp).format(
          "Do MMMM YYYY HH:mm:ss"
        )}`,
        `**❯ Flags:** ${flags}`,
      ])
      .addField("Member Info", [
        `**❯ Permission Level:** ${permissionLevel ?? "Unverified"}`,
        `**❯ Experience:** ${profile?.xp || 0}xp`,
        `**❯ Level:** ${profile?.level || 0}`,
        `**❯ Credits:**`,
        `\u3000 **Pocket:** ${profile.pocket} ₪`,
        `\u3000 **Bank:** ${profile.bank} ₪`,
        "**❯ Boosters:** " + profile.boosters.xp ? `x${profile.boosters.xp}` : "None",
        `**❯ Bodyguard:** ${
          message.guild && message.author.id === user.id
            ? "DM me :wink:"
            : message.author.id !== user.id
            ? "Wouldn't you like to know? <:yPepe:648519031816454154>"
            : profile.bodyguard ?? "none... you should really buy one."
        }`,
        `**❯ Joined At:** ${utc(
          (await message.guild?.members.fetch(user))?.joinedTimestamp
        ).format("Do MMMM YYYY HH:mm:ss")}`,
      ]);
    return message.util?.send(embed);
  }
}

type args = {
  user: User;
};
