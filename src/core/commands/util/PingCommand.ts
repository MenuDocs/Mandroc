import { command, MandrocCommand } from "@lib";
import type { Message } from "discord.js";

@command("ping", {
  aliases: ["ping", "latency"],
})
export default class PingCommand extends MandrocCommand {
  public async exec(message: Message) {
    return message.util?.send("Pinging the mainframe...").then((m) => {
      const hb = Math.round(this.client.ws.ping);
      const api = m.createdTimestamp - message.createdTimestamp;
      return message.util?.edit(
        `**Pong!** Heartbeat: *${hb}ms*, Roundtrip: *${api}ms*`
      );
    });
  }
}
