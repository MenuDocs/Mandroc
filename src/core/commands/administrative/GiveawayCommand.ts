/*
 * Copyright (c) MenuDocs 2021.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { command, MandrocCommand } from "@lib";
import type { Message } from "discord.js";

@command("giveaway", {
  description: {
    content: "Manages giveaways within MenuDocs",
    examples: [
      "giveaway create"
    ]
  },
})
export class GiveawayCommand extends MandrocCommand {
  async exec(message: Message) {
    message.util?.send("ur gay lol")
  }
}