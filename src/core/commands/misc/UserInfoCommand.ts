import { command, Embed, MandrocCommand, PermissionLevel, Profile } from "@lib";

import type { Message, User } from "discord.js";
import utc from "moment";

@command("userinfo", {
  aliases: [ "userinfo", "bal", "balance", "ui", "profile" ],
  description: {
    content: "Displays a user's info",
    usage: "[user]",
    examples: (prefix: string) => [ `${prefix}userinfo`, `${prefix}ui @2D` ],
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

    const embed = Embed.Primary()
      .setThumbnail(user.displayAvatarURL());

    /* general info */

    // user flags
    const userFlags = (await user.fetchFlags())
      .toArray()
      .map(u => u.split("_"))
      .map(s => s.map(p => p.capitalize()))
      .map(s => s.join(" "))
      .join(", ");

    embed.addField("User Info", [
      `**❯ Name:** ${user.tag}`,
      `**❯ ID:** ${user.id}`,
      `**❯ Created At:** ${utc(user.createdTimestamp).format("Do MMMM YYYY HH:mm:ss")}`,
      `**❯ Flags:** ${userFlags || "None"}`,
    ]);

    /* profile */

    // bodyguard
    const bodyguard = message.guild && message.author.id === user.id
      ? "DM me :wink:"
      : message.author.id !== user.id
        ? "Wouldn't you like to know? <:yPepe:648519031816454154>"
        : profile.bodyguard ?? "none... you should really buy one.";

    // boosters
    const boosters = Object.entries(profile.boosters)
      .filter(([ , mod ]) => mod !== 1)
      .map(([ name, mod ]) => `*${mod}x ${name.capitalize()}*`)
      .join(", ");

    // permission level
    let permissionLevel = null;
    if (message.guild) {
      const member = message.guild.members.cache.get(user.id);
      if (member && member.permissionLevel != null) {
        permissionLevel = PermissionLevel[member.permissionLevel]
          .split(/(?=[A-Z])/)
          .join(" ");
      }
    }

    embed.addField("Member Info", [
      `**❯ Permission Level:** ${message.guild ? permissionLevel ?? "Unverified" : "Unknown"}`,
      `**❯ Experience:** ${profile?.xp || 0}xp`,
      `**❯ Level:** ${profile?.level || 0}`,
      `**❯ Credits:**`,
      `\u3000 **Pocket:** ${profile.pocket} ₪`,
      `\u3000 **Bank:** ${profile.bank} ₪`,
      `**❯ Boosters:** ${boosters || "None"}`,
      `**❯ Bodyguard:** ${bodyguard}`,
      `**❯ Joined At:** ${utc(
        (await message.guild?.members.fetch(user))?.joinedTimestamp,
      ).format("Do MMMM YYYY HH:mm:ss")}`,
    ]);

    return message.util?.send(embed);
  }
}

type args = {
  user: User;
};
