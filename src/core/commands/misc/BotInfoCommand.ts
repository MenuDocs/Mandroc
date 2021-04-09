import { capitalize, Color, command, MandrocCommand } from "@lib";
import { Message, MessageEmbed } from "discord.js";
import ms from "ms";
import os from "os";

@command("botinfo", {
  aliases: [ "botinfo", "bi" ],
  description: {
    content: "Displays bot info",
    examples: (prefix: string) => [ `${prefix}botinfo` ],
  },
})
export default class AvatarCommand extends MandrocCommand {
  public async exec(message: Message) {
    const developers = [
      this.client.users.cache.get("396096412116320258"),
      this.client.users.cache.get("277211104390807552"),
    ];

    const commandCount = this.handler.modules
      .filter(c => c.aliases.length > 0)
      .size;

    const embed = new MessageEmbed()
      .setColor(Color.Primary)
      .setThumbnail(this.client.user?.displayAvatarURL({ size: 2048 })!)
      .setDescription([
        "**Description**",
        "The official community bot of **MenuDocs**.",
        "A bot developed to ease the lives of everyone in this guild.",
        "With Mandroc's incredible modules and features, it's an irreplaceable piece of MenuDocs.",
        "To see how **Mandroc** can help you while programming, run !help",
      ])
      .addField("Bot Info", [
        `**❯ Name:** ${this.client.user?.tag}`,
        `**❯ Commands:** ${commandCount}`,
        `**❯ Total Users:** ${this.client.guilds.cache.reduce(
          (a, b) => a + b.memberCount,
          0,
        )}`,
        `**❯ Total Guilds:** ${this.client.guilds.cache.size}`,
        `**❯ Developers:** ${developers.join(", ")}`,
        `**❯ Uptime:** ${ms(this.client.uptime as number, { long: true })}`,
        `**❯ Platform:** ${capitalize(os.platform())}`,
        `**❯ Library:** [discord.js](https://discord.js.org/)`,
      ]);

    return message.util?.send(embed);
  }
}
