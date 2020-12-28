/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { command, MandrocCommand } from "@lib";
import type { Message } from "discord.js";
import ms from "ms";

@command("uptime", {
  aliases: ["uptime"],
  description: {
    content: "Shows the bot's uptime.",
    examples: (prefix: string) => [`${prefix}uptime`],
  },
})
export default class PingCommand extends MandrocCommand {
  public async exec(message: Message) {
    return message.util?.send(
      `I have been up for: \`${ms(this.client.uptime as number, {
        long: true,
      })}\``
    );
  }
}
