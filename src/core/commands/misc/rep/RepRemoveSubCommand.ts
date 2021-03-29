/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { command, MandrocCommand } from "@lib";
import type { Message } from "discord.js";

@command("rep-remove", {})
export class RepRemoveSubCommand extends MandrocCommand {
  async exec(message: Message) {
    message.util?.send("ok test")
  }
}
