import { Command, Listener } from "discord-akairo";
import { listener } from "@lib";

import type { Message } from "discord.js";

@listener("command-started", {
  event: "commandStarted",
  emitter: "commands"
})
export class CommandStartedListener extends Listener {
  async exec(message: Message, command: Command) {
    this.client.log.debug(
      `${message.author.tag} (${message.author.id}) -> ${command.id}`,
      "commands"
    );
  }
}
