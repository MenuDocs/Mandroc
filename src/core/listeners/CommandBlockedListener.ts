import { Command, Listener } from "discord-akairo";
import { Embed, listener } from "@lib";
import { Disabled } from "../inhibitors/Disabled";

import type { Message } from "discord.js";

@listener("command-blocked", {
  event: "commandBlocked",
  emitter: "commands"
})
export class CommandStartedListener extends Listener {
  async exec(message: Message, command: Command, reason: string) {
    if (reason === Disabled.INHIBITOR_REASON) {
      const embed = Embed.warning("This command is disabled.");
      await message.util?.send(embed);
    }

    this.client.log.debug(
      `blocked: ${message.author.tag} (${message.author.id}) -> ${command.id}, reason=${reason}`,
      "commands"
    );
  }
}
