import { MessageEmbed } from "discord.js";
import { Color } from "./constants";

export namespace Embed {

  /**
   * 
   * @param content The Embeds Description
   * @param author The embeds author field
   */
  export function primary(content?: string | string[], author?: string, footer?: string): MessageEmbed {
    const embed = new MessageEmbed().setColor(Color.Primary);

    if (content) embed.setDescription(content);

    if (author) embed.setAuthor(author);

    if (footer) embed.setFooter(footer);

    return embed;
  }

  export function danger(content?: string, author?: string, footer?: string): MessageEmbed {
    const embed = new MessageEmbed().setColor(Color.Danger);
    if (content) embed.setDescription(content);

    if (author) embed.setAuthor(author);

    if (footer) embed.setFooter(footer);

    return embed;
  }

  export function warning(content?: string, author?: string, footer?: string): MessageEmbed {
    const embed = new MessageEmbed().setColor(Color.Warning);
    if (content) embed.setDescription(content);

    if (author) embed.setAuthor(author);

    if (footer) embed.setFooter(footer);

    return embed;
  }

  export function success(content?: string, author?: string, footer?: string): MessageEmbed {
    const embed = new MessageEmbed().setColor(Color.Success);
    if (content) embed.setDescription(content);

    if (author) embed.setAuthor(author);

    if (footer) embed.setFooter(footer);

    return embed;
  }
}