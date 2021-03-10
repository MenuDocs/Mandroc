import { Listener } from "discord-akairo";
import { listener } from "@lib";

@listener("debug", {
  event: "debug",
  emitter: "client"
})
export class CommandRanListener extends Listener {
  async exec(message: string) {
    this.client.log.debug(message);
  }
}