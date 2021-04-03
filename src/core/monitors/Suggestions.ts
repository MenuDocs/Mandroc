import { IDs, monitor, Monitor } from "@lib";
import type { Message } from "discord.js";

@monitor("suggestions")
export class Suggestions extends Monitor {
  async exec(message: Message) {
    if (message.partial) {
      await message.fetch();
    }

    if (message.channel.id !== IDs.SUGGESTIONS) {
      return;
    }

    // React to the message.
    await Promise.all(["✅", "❌", "🤷"].map((e) => message.react(e)));
  }
}
