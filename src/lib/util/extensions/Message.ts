/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { MessageEmbed, Structures } from "discord.js";
import { Color } from "../constants";

const emojis = ["✅", "❌"];

class MandrocMessage extends Structures.get("Message") {
  public prompt(content: string, embedded = true): Promise<boolean> {
    return new Promise(async (resolve) => {
      const _content = embedded
        ? new MessageEmbed().setColor(Color.PRIMARY).setDescription(content)
        : content;

      await this.util?.send(_content);
      await Promise.all(emojis.map(this.react.bind(this)));

      this.createReactionCollector(
        (r, u) => emojis.includes(r.emoji.name) && u.id === this.author.id,
        {
          max: 1,
          time: 10000,
        }
      ).on("end", async (r) => {
        await this.reactions.removeAll();
        resolve(!!r.size && r.first()?.emoji.name !== "❌");
      });
    });
  }
}

Structures.extend("Message", () => MandrocMessage);
