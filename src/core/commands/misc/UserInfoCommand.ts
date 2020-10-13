import {
  Color,
  command,
  MandrocCommand,
  PermissionLevel,
  Profile,
  registerUser,
} from "@lib";
import { Message, MessageEmbed, User } from "discord.js";
import utc from "moment";
import type { ObjectID } from "typeorm";

@command("userinfo", {
  aliases: ["ui"],
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
export default class AvatarCommand extends MandrocCommand {
  public async exec(message: Message, { user }: args) {
    let profile = await Profile.findOne({ _id: user.id });
    if (!profile)
      profile = await registerUser((user.id as unknown) as ObjectID);

    const memberPermissionLevel = message.member?.permissionLevel
      ? PermissionLevel[message.member.permissionLevel]
      : undefined;
    const embed = new MessageEmbed()
      .setColor(Color.Primary)
      .setThumbnail(user.displayAvatarURL())
      .addField("User Info", [
        `**❯ Name:** ${user.tag}`,
        `**❯ ID:** ${user.id}`,
        `**❯ Created At:** ${utc(user.createdTimestamp).format(
          "Do MMMM YYYY HH:mm:ss"
        )}`,
        `**❯ Flags:** ${
          user.flags
            ? `\n${(await user.fetchFlags(true))
                .toArray()
                .map((flag) => `\u3000\`${flag}\``)
                .join(",\n")}`
            : "None"
        }`,
      ])
      .addField("Member Info", [
        `**❯ Permission Level:** ${
          memberPermissionLevel ? memberPermissionLevel : "Unverified"
        }`,
        `**❯ Experience:** ${profile?.xp || 0}xp`,
        `**❯ Level:** ${profile?.level || 0}`,
        `**❯ Credits:**`,
        `\u3000 **Pocket:** ${profile.pocket}`,
        `\u3000 **Bank:** ${profile.bank}`,
        `**❯ Boosters:** ${profile?.boosters || "None"}`,
        `**❯ Bodyguard:** ${
          message.guild && message.author == user
            ? "DM me :wink:"
            : message.author != user
            ? "You would like to know"
            : profile?.bodyguard
            ? profile.bodyguard
            : "None"
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
