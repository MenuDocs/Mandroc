import { Color, command, MandrocCommand } from "@lib";
import { Message, MessageEmbed, User } from "discord.js";
import utc from "moment";

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
    const embed = new MessageEmbed()
      .setColor(Color.Primary)
      .setThumbnail(user.displayAvatarURL())
      .addField("User Info", [
        `**❯ Name:** ${user.tag}`,
        `**❯ ID:** ${user.id}`,
        `**❯ Mandroc Permission Level:** ${
          (this.client.ownerID as Array<string>).includes(user.id)
            ? "Owner"
            : "Member"
        }`,
        `**❯ Created At:** ${utc(user.createdTimestamp).format(
          "Do MMMM YYYY HH:mm:ss"
        )}`,
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
