import { listener, Listener } from "@lib";

@listener({ event: "ready" })
export class ReadyListener extends Listener {
  public run() {
    this.client.log.info(`Mandroc is now ready... Serving ${this.client.users.cache.size} users!`);
    return;
  }
}