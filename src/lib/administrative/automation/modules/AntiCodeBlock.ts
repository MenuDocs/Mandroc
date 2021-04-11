import { Module } from "../Module";
import { Embed } from "../../../util";

import type { Message } from "discord.js";

export class AntiCodeBlock extends Module {
  readonly priority = 1;

  async run(message: Message) {
    if (message.member?.permissionLevel == null) {
      return false;
    }

    const content = message.content.split("\n");
    if (content.includes("```") && content.length >= 10) {
      if (message.member?.permissionLevel <= 1) {
        await message.delete();
        message.util
          ?.send(
            Embed.Primary(
              `${message.author}, use a bin to prevent bulking the chat.`
            )
          )
          .then(m => m.delete({ timeout: 6000 }));

        return true;
      }
    }

    return false;
  }
}
