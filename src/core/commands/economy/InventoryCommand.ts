import { command, Embed, MandrocCommand } from "@lib";
import type { Message } from "discord.js";

@command("inventory", {
  aliases: ["inventory", "tools", "inv"],
  description: {
    content: "Displays your inventory.",
    examples: (prefix: string) => [`${prefix}inventory`],
    usage: "!inventory"
  }
})
export default class FishCommand extends MandrocCommand {
  public async exec(message: Message) {
    const profile = await message.member?.getProfile()!;
    if (!profile.inventory.length) {
      return message.util?.send("You do not possess any tools!");
    }

    let desc = profile.inventory.map(
      tool => `${tool.name}\n\u3000 **Durability:** ${tool.durability}`
    );

    const embed = Embed.Primary(desc)
      .setTitle("Your tools")
      .setFooter(
        message.author.tag,
        message.author.displayAvatarURL({ size: 2048, dynamic: true })
      );

    return message.util?.send(embed);
  }
}
