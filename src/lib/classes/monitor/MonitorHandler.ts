import { addBreadcrumb, captureException, Severity } from "@sentry/node";
import { AkairoHandler, AkairoHandlerOptions } from "discord-akairo";
import { Monitor } from "./Monitor";

import type { Mandroc } from "@lib";
import type { Collection } from "discord.js";

export class MonitorHandler extends AkairoHandler {
  modules!: Collection<string, Monitor>;

  /**
   * @param client The mandroc client.
   * @param options The handler options.
   */
  constructor(client: Mandroc, options: AkairoHandlerOptions = {}) {
    super(client, {
      classToHandle: Monitor,
      ...options,
    });

    this.client.on("message", async (message) => {
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
            message: "Monitor Errored",
            data: {
              monitor: id,
            },
          });

          captureException(e);
        }
      }
    });
  }
}
