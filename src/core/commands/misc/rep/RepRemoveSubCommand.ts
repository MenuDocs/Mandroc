import { command, MandrocCommand } from "@lib";
import type { Message } from "discord.js";

@command("rep-remove", {})
export class RepRemoveSubCommand extends MandrocCommand {
  async exec(message: Message) {
    message.util?.send("ok test")
  }
}
