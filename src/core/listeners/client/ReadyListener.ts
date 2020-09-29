import { Listener } from "discord-akairo";
import { listener, load } from "@lib";

@listener("ready", { event: "ready", emitter: "client" })
export default class ReadyListener extends Listener {
  public exec() {
    this.client.log.info(
      `Mandroc is now ready... Serving ${this.client.users.cache.size} users!`
    );

    load()
      .then(() => this.client.log.complete("Loaded all MDN entries."))
      .catch((e) => {
        this.client.log.error("Error loading MDN", e);
        this.client.canMDN = false;
      });

    return;
  }
}
