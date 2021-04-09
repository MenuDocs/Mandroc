import { Inhibitor } from "discord-akairo";

import type { Message } from "discord.js";
import type { MandrocCommand } from "@lib";

export default class PermissionLevelInhibitor extends Inhibitor {
  public constructor() {
    super("permission-level", {
      category: "permissions",
      priority: 1,
      reason: "permissionLevel"
    });
  }

  public async exec(message: Message, command: MandrocCommand) {
    if (
      !message.guild ||
      !message.member ||
      message.member.permissionLevel === null
    ) {
      return false;
    }

    if (process.env.NODE_ENV === "development" && this.client.isOwner(message.author.id)) {
      return false;
    }

    return !message.member.above(command.permissionLevel);
  }
}
