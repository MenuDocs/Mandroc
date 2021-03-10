/*
 * Copyright (c) MenuDocs 2021.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { adminCommand, Embed, MandrocCommand } from "@lib";
import { Flag } from "discord-akairo";

@adminCommand("giveaway", {
  aliases: ["giveaway", "ga"],
  description: {
    content: "Manages giveaways within MenuDocs",
    usage: "<create|edit> ...",
    examples: [
      "giveaway create"
    ]
  },
})
export class GiveawayCommand extends MandrocCommand {
  *args() {
    const method = yield {
      type: [
        ["giveaway-end", "end", "e"],
        ["giveaway-create", "create", "c", "new", "n"],
      ],
      otherwise: Embed.Primary([
        "Please provide a subcommand.",
        "",
        "**`end`** - ends a giveaway with the provided id.",
        "**`create`** - creates a giveaway.",
      ]),
    };

    return Flag.continue(method);
  }
}