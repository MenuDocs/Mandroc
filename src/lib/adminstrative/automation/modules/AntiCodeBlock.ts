import { Module } from "../Module";

import type { Message } from "discord.js";

export class AntiCodeBlock extends Module {
  public readonly priority = 1;

  public async run(message: Message) {
    const content = message.content.split(" ").join(".");

    if (
      content.includes("```") &&
      content.split(".").length >= 10 &&
      message.member?.permissionLevel &&
      message.member?.permissionLevel <= 1
    ) {
      if (message.deletable) await message.delete();
      message.channel.send("Please use a bin to prevent bulking the chat!");
      return true;
    }

    return false;
  }
}
