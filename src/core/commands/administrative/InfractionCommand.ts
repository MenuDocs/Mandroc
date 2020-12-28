/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { adminCommand, Embed, MandrocCommand } from "@lib";
import { Flag } from "discord-akairo";

@adminCommand("infraction", {
  aliases: ["infraction", "i", "case"],
  description: {
    content: "Utility for viewing/editing infractions.",
    usage: "[edit|info] ...args",
    examples: (prefix: string) => [
      `${prefix}infraction edit 4 reason "ur bad"`,
      `${prefix}infraction view 4`,
    ],
  },
})
export class InfractionCommand extends MandrocCommand {
  *args() {
    const method = yield {
      type: [
        ["infraction-edit", "edit", "e"],
        ["infraction-view", "view", "info", "i", "v"],
      ],
      otherwise: Embed.Primary([
        "Please provide a subcommand.",
        "**`view`** - displays information on the provided infraction.",
        "**`edit`** - allows editing of an infraction.",
      ]),
    };

    return Flag.continue(method);
  }
}
