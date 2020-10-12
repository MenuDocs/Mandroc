import { Color, command, MandrocCommand, capitalize } from "@lib";
import { Message, MessageEmbed } from "discord.js";
import ms from "ms";
import os from "os";

@command("botinfo", {
  aliases: ["botinfo", "bi"],
  description: {
    content: "Displays bot info",
    examples: (prefix: string) => [`${prefix}botinfo`],
  },
})
export default class AvatarCommand extends MandrocCommand {
  public async exec(message: Message) {
    const developers = [
      this.client.users.cache.get("396096412116320258"),
      this.client.users.cache.get("277211104390807552"),
    ];

    let commandLength = 0;

    for (const [_, category] of this.handler.categories) {
      commandLength += category.map((cmd) => cmd.aliases[0]).length;
    }

    const embed = new MessageEmbed()
      .setColor(Color.Primary)
      .setThumbnail(
        this.client.user?.displayAvatarURL({ size: 2048 }) as string
      )
      .setDescription([
        "**Description**",
        "The official community bot of **MenuDocs**.",
        "A bot developed for both fun, but also as a development helper.",
        "To see how **Mandroc** can help you while programming, run !help",
      ])
      .addField("Bot Info", [
        `**❯ Name:** ${this.client.user?.tag}`,
        `**❯ Commands:** ${commandLength}`,
        `**❯ Total Users:** ${this.client.guilds.cache.reduce(
          (a, b) => a + b.memberCount,
          0
        )}`,
        `**❯ Total Guilds:** ${this.client.guilds.cache.size}`,
        `**❯ Developers:** ${developers.join(", ")}`,
        `**❯ Uptime:** ${ms(this.client.uptime as number, { long: true })}`,
        `**❯ Platform:** ${capitalize(os.platform())}`,
        `**❯ Library:** [discord.js](https://discord.js.org/)`,
      ]);

    message.util?.send(embed);
  }
}
