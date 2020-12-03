/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { Listener } from "discord-akairo";
import { listener, MDN } from "@lib";

@listener("ready", { event: "ready", emitter: "client" })
export default class ReadyListener extends Listener {
  public exec() {
    this.client.log.info(
      `Mandroc is now ready... Serving ${this.client.users.cache.size} users!`
    );

    MDN.load()
      .then(() => this.client.log.debug("Loaded all MDN entries."))
      .catch((e) => {
        this.client.log.error("Error loading MDN", e);
        this.client.canMDN = false;
      });

    return;
  }
}
