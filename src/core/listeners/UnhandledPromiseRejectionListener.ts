/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { Listener } from "discord-akairo";
import { listener } from "@lib";

@listener("unhandled-rejection", {
  event: "unhandledRejection",
  emitter: "process",
})
export class UnhandledPromiseRejectionListener extends Listener {
  async exec(prom: any) {
    this.client.log.error(prom);
  }
}
