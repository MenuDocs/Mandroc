/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { Module } from "../Module";

import type { Message } from "discord.js";
import { Embed } from "@lib";

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
          .then((m) => m.delete({ timeout: 6000 }));

        return true;
      }
    }

    return false;
  }
}
