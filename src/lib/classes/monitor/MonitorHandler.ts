import { addBreadcrumb, captureException, Severity } from "@sentry/node";
import { AkairoHandler, AkairoHandlerOptions } from "discord-akairo";
import { Monitor } from "./Monitor";

import type { Collection } from "discord.js";
import type { Mandroc } from "../../Client";

export class MonitorHandler extends AkairoHandler {
  modules!: Collection<string, Monitor>;

  /**
   * @param client The mandroc client.
   * @param options The handler options.
   */
  constructor(client: Mandroc, options: AkairoHandlerOptions = {}) {
    super(client, {
      classToHandle: Monitor,
      ...options
    });

    this.client.on("message", async message => {
      for (const [id, monitor] of this.modules) {
        if (monitor.ignore.includes(message.type)) {
          continue;
        }

        try {
          await monitor.exec(message);
        } catch (e) {
          addBreadcrumb({
            category: "monitors",
            level: Severity.Error,
            message: "Monitor Encountered Error",
            data: { monitor: id }
          });

          captureException(e);
        }
      }
    });
  }
}
