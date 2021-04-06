import { Listener } from "discord-akairo";
import { listener } from "@lib";
import type { Message } from "discord.js";

@listener("message-invalid-listener", {
  event: "messageInvalid",
  emitter: "commands",
})
export default class MessageInvalidListener extends Listener {
  public async exec(message: Message) {
    if (message.guild && message.util?.parsed?.prefix) {
      if (!message.util?.parsed?.alias || !message.util?.parsed?.afterPrefix) {
        return;
      }

      const command = this.client.commandHandler.modules.get("tag-show")!;
      return this.client.commandHandler.runCommand(
        message,
        command,
        await command.parse(message, message.util?.parsed?.afterPrefix)
      );
    }
  }
}
