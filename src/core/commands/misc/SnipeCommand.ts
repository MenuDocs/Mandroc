/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { command, Embed, MandrocCommand } from "@lib";
import { Argument } from "discord-akairo";

import type { Message } from "discord.js";

@command("snipe", {
  aliases: ["snipe"],
  description: "Get the last deleted message of a text channel.",
  channel: "guild",
  args: [
    {
      id: "amount",
      type: Argument.range("number", 1, 6),
      default: 5,
    },
  ],
})
export default class SnipeCommand extends MandrocCommand {
  public async exec(message: Message, { amount }: args) {
    const sniped = message.channel.lastDeletedMessages;
    if (!sniped) {
      const embed = Embed.Primary("No sniped messages :flushed:");
      return message.util?.send(embed);
    }

    const embed = Embed.Primary();

    let passed = false;
    for (const snipe of sniped.slice(0, amount).reverse()) {
      const user = await this.client.users.fetch(snipe.author, true);
      const content = [`Author : "${user.tag} (${snipe.author})"`, "\n```"];

      if (snipe.attachments.length) {
        const attachments = snipe.attachments
          .map((a, i) => `[Att ${i + 1}](${a})`)
          .join(", ");
        content.push(`**Attachments**: ${attachments || "none"}`);
      }

      if (snipe.content) {
        content.unshift(snipe.content, "");
      }

      content.unshift("```prolog\n");
      embed.addField(!passed ? `Sniped Messages` : "\u200b", content);
      passed = true;
    }

    return message.util?.send(embed);
  }
}

type args = {
  amount: number;
};
