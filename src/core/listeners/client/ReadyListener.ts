import { Listener } from "discord-akairo";
import { listener } from "@lib";

@listener("ready", { event: "ready", emitter: "client" })
export default class ReadyListener extends Listener {
  public exec() {
    this.client.log.info(
      `Mandroc is now ready... Serving ${this.client.users.cache.size} users!`
    );
    return;
  }
}
