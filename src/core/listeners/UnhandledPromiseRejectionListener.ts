import { Listener } from "discord-akairo";
import { listener } from "@lib";
import { captureException } from "@sentry/node";

@listener("unhandled-rejection", {
  event: "unhandledRejection",
  emitter: "process"
})
export class UnhandledPromiseRejectionListener extends Listener {
  async exec(prom: any) {
    this.client.log.error(prom);
    captureException(prom);
  }
}
