import { adminCommand, Embed, MandrocCommand } from "@lib";
import { Flag } from "discord-akairo";

@adminCommand("role", {
  aliases: ["role", "r"],
  description: {
    content: "Utility for adding/removing roles from different members.",
    usage: "[add|remove] ...args",
    subcommands: {
      add: "role-add",
      remove: "role-remove"
    },
    examples: (prefix: string) => [
      `${prefix}role add 2D Admin --persist`,
      `${prefix}role remove 2D FOTD`,
      `${prefix}role remove 2D Admin`
    ]
  }
})
export class InfractionCommand extends MandrocCommand {
  *args() {
    const method = yield {
      type: [
        ["role-add", "add", "+"],
        ["role-remove", "remove", "rem", "rm", "-"]
      ],
      otherwise: Embed.Primary([
        "Please provide a subcommand.",
        "**`add`** - adds a role to the provided member",
        "**`remove`** - removes a role from the provided member"
      ])
    };

    return Flag.continue(method);
  }
}
