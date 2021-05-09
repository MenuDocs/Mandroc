import { Inhibitor } from "discord-akairo";
import { config, inhibitor, MandrocCommand } from "@lib";

import type { Message } from "discord.js";

@inhibitor("disabled", {
  priority: 1,
  reason: Disabled.INHIBITOR_REASON
})
export class Disabled extends Inhibitor {
  static INHIBITOR_REASON = "disabled-command";

  exec(_: Message, command: MandrocCommand): boolean {
    const disabledCommands = config.get<string[]>("commands.disabled", {
      envType: "array",
      default: []
    });

    return disabledCommands.includes(command.id);
  }
}
