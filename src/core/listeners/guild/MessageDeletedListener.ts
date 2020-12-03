/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { Listener } from "discord-akairo";
import { Embed, IDS, listener } from "@lib";

import type { Message, TextChannel } from "discord.js";

@listener("message-deleted", { event: "messageDelete", emitter: "client" })
export default class MessageDeletedListener extends Listener {
  public exec(message: Message): any {
    this.snipe(message);

    const logs = message.guild?.channels.cache.get(IDS.LOG_CHANNEL) as
        | TextChannel
        | undefined,
      embed = Embed.Primary()
        .setTimestamp()
        .setAuthor(
          "Message Deleted",
          message.author.displayAvatarURL({ dynamic: true })
        )
        .setDescription([
          `**Author**: ${message.author.tag} \`(${message.author.id})\``,
          `**Channel**: ${message.channel} \`(${message.channel.id})\``,
        ])
        .addField("\u200E", message.cleanContent);

    logs?.send(embed);
  }

  snipe(message: Message) {
    if (message.partial || message.channel.type === "dm") {
      return;
    }

    if (!message.channel.lastDeletedMessages) {
      message.channel.lastDeletedMessages = [];
    }

    message.channel.lastDeletedMessages.unshift({
      content: message.content,
      attachments: message.attachments.map((a) => a.proxyURL),
      author: message.author.id,
    });

    if (message.channel.lastDeletedMessages.length > 5) {
      while (message.channel.lastDeletedMessages.length > 5) {
        message.channel.lastDeletedMessages.pop();
      }
    }
  }
}
