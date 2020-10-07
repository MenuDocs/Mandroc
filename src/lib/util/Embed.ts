import { MessageEmbed } from "discord.js";
import { Color } from "@lib";

export class Embed {
  public static Primary(content?: string): MessageEmbed {
    const embed = new MessageEmbed()
      .setColor(Color.Primary);

    if (content)
      embed.setDescription(content);

    return embed;
  }

  public static Error(content?: string): MessageEmbed {
    const embed = new MessageEmbed()
      .setColor(Color.Primary);

    if (content)
      embed.setDescription(content);

    return embed;
  }
}