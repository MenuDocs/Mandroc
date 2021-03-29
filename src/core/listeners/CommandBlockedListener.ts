import { Command, Listener } from "discord-akairo";
import { listener } from "@lib";
import type { Message } from "discord.js";

@listener("command-blocked", {
  event: "commandBlocked",
  emitter: "commands",
})
export class CommandStartedListener extends Listener {
  async exec(message: Message, command: Command, reason: string) {
    this.client.log.debug(`blocked: ${message.author.tag} (${message.author.id}) -> ${command.id}, reason=${reason}`, "commands");
  }
}