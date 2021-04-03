import { adminCommand, Embed, MandrocCommand } from "@lib";
import { Flag } from "discord-akairo";

@adminCommand("reaction-roles", {
  aliases: ["reaction-roles", "rr"],
  description: {
    content: "Utility for adding/removing reaction roles.",
    usage: "[add|remove] ...args",
    subcommands: {
      add: "rr-add",
      remove: "rr-remove",
    },
    examples: (prefix: string) => [
      `${prefix}rr add #roles 792273150720081941 FOTD`,
      `${prefix}rr remove #roles 792273150720081941 FOTD`,
      `${prefix}rr remove #roles 792273150720081941`,
    ],
  },
})
export class InfractionCommand extends MandrocCommand {
  *args() {
    const method = yield {
      type: [
        ["rr-add", "add", "a", "new", "create", "+"],
        ["rr-remove", "remove", "r", "rf", "rm", "rem", "-"],
      ],
      otherwise: Embed.Primary([
        "Please provide a subcommand.",
        "**`add`** - adds a reaction role to a message.",
        "**`remove`** - removes a reaction role from a message or all if no emoji is provided.",
      ]),
    };

    return Flag.continue(method);
  }
}
