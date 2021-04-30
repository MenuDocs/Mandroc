import ms from "ms";
import { Resolver } from "@lib";

import type { Message } from "discord.js";

export class DurationResolver extends Resolver<number> {
  constructor() {
    super("duration", {
      name: "duration"
    });
  }

  exec(_: Message, phrase?: string | null): number | null {
    if (!phrase) {
      return null;
    }

    const _ms = ms(phrase);
    return !_ms ? null : _ms;
  }
}
