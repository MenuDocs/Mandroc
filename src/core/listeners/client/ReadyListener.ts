/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { Listener } from "discord-akairo";
import { listener, Scheduler } from "@lib";

@listener("ready", { event: "ready", emitter: "client" })
export default class ReadyListener extends Listener {
  async exec() {
    this.client.log.info(
      `Mandroc is now ready... Serving ${this.client.users.cache.size} users!`
    );

    await Scheduler.get().init();
    return;
  }
}
