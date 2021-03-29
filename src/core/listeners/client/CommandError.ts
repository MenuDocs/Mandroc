import { Embed, listener } from "@lib";
import { Listener } from "discord-akairo";
import { captureException } from "@sentry/node";

import type { Message } from "discord.js";

@listener("command-error", { event: "error", emitter: "commands" })
export class CommandError extends Listener {
  async exec(error: Error, message: Message) {
    this.client.log.error(error);
    message.util?.send(
      Embed.Primary(
        "Oops, I ran into an error. Please report this to the developers."
      )
    );

    captureException(error);
  }
}
