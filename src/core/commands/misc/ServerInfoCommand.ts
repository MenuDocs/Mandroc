import { Color, command, MandrocCommand } from "@lib";
import { Message, MessageEmbed } from "discord.js";
import moment from "moment";

@command("serverinfo", {
  aliases: ["serverinfo", "si", "guildinfo", "gi"],
  description: {
    content: "Displays the server's info",
    examples: (prefix: string) => [`${prefix}serverinfo`],
  },
})
export default class ServerInfo extends MandrocCommand {
  public async exec(message: Message) {
    const { guild } = message;
    const { cache: members } = guild?.members!!;
    const { cache: emojis } = guild?.emojis!!;
    const roles = guild?.roles?.cache.sort((a, b) => b.position - a.position)!!;

    const embed = new MessageEmbed()
      .setColor(Color.PRIMARY)
      .setThumbnail(guild?.iconURL({ dynamic: true })!!)
      .addField("Server Info", [
        `**❯ Name:** ${guild?.name}`,
        `**❯ ID:** ${guild?.id}`,
        `**❯ Owner:** ${guild?.owner}`,
        `**❯ Time Created:** ${moment(guild?.createdTimestamp).format(
          "Do MMMM YYYY HH:mm:ss"
        )}`,
        `**❯ Boost Count:** ${guild?.premiumSubscriptionCount || 0}`,
        `**❯ Boost Tier:** ${guild?.premiumTier || "None"}`,
        `**❯ Members:**`,
        `\u3000 **Total:** ${message.guild?.memberCount}`,
        `\u3000 **Humans:** ${members?.filter((x) => !x.user.bot).size}`,
        `\u3000 **Bots:** ${members?.filter((x) => x.user.bot).size}`,
        `**❯ Emojis:**`,
        `\u3000 **Static:** ${
          emojis?.size > 10
            ? [...emojis.map((x) => x).values()]
                .filter((x, i) => (i < 10 && !x.animated ? x : ""))
                .join(" ") + `& *${emojis.size - 10} more*`
            : emojis
                ?.filter((x) => !x.animated)
                .map((x) => x)
                .join(", ") || "None"
        }`,
        `\u3000 **Animated:** ${
          emojis?.size > 10
            ? [...emojis.map((x) => x).values()]
                .filter((x, i) => (i < 10 && x.animated ? x : ""))
                .join(" ") + `& *${emojis.size - 10} more*`
            : emojis
                ?.filter((x) => x.animated)
                .map((x) => x)
                .join(", ") || "None"
        }`,
        `**❯ Roles:** ${
          roles?.size > 10
            ? [...roles.map((x) => x).values()]
                .filter((x, i) => (i < 10 ? x : ""))
                .join(" ") + `& *${roles.size - 10} more*`
            : roles?.map((x) => x).join(", ")
        }`,
      ]);

    return message.util?.send(embed);
  }
}
