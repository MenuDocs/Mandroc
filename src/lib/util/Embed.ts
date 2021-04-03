import { MessageEmbed } from "discord.js";
import { Color } from "@lib";

export class Embed {
  public static Primary(content?: string | string[]): MessageEmbed {
    const embed = new MessageEmbed().setColor(Color.PRIMARY);

    if (content) embed.setDescription(content);

    return embed;
  }

  public static Danger(content?: string): MessageEmbed {
    const embed = new MessageEmbed().setColor(Color.DANGER);

    if (content) embed.setDescription(content);

    return embed;
  }

  public static Warning(content?: string): MessageEmbed {
    const embed = new MessageEmbed().setColor(Color.WARNING);

    if (content) embed.setDescription(content);

    return embed;
  }

  public static Success(content?: string): MessageEmbed {
    const embed = new MessageEmbed().setColor(Color.SUCCESS);

    if (content) embed.setDescription(content);

    return embed;
  }
}
