import { Inhibitor } from "discord-akairo";
import { inhibitor, MandrocCommand } from "@lib";

import type { Message } from "discord.js";

@inhibitor("permission-level", {
  category: "permissions",
  priority: 1,
  reason: "permissionLevel"
})
export default class PermissionLevelInhibitor extends Inhibitor {
  async exec(message: Message, command: MandrocCommand) {
    if (!message.guild || !message.member || message.member.permissionLevel === null) {
      return false;
    }

    if (process.env.NODE_ENV === "development" && this.client.isOwner(message.author.id)) {
      return false;
    }

    console.log(command.permissionLevel, message.member.permissionLevel)
    return command.permissionLevel > message.member.permissionLevel;
  }
}
