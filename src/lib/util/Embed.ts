import { MessageEmbed } from "discord.js";
import { Color } from "./constants";

export namespace Embed {
  export function primary(content?: string | string[]): MessageEmbed {
    const embed = new MessageEmbed().setColor(Color.Primary);

    if (content) embed.setDescription(content);

    return embed;
  }

  export function danger(content?: string): MessageEmbed {
    const embed = new MessageEmbed().setColor(Color.Danger);
    if (content) {
      embed.setDescription(content);
    }

    return embed;
  }

  export function warning(content?: string): MessageEmbed {
    const embed = new MessageEmbed().setColor(Color.Warning);
    if (content) {
      embed.setDescription(content);
    }

    return embed;
  }

  export function success(content?: string): MessageEmbed {
    const embed = new MessageEmbed().setColor(Color.Success);
    if (content) {
      embed.setDescription(content);
    }

    return embed;
  }
}
