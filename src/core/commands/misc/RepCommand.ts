/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { command, MandrocCommand } from "@lib";
import { Flag } from "discord-akairo";

@command("rep", { aliases: ["rep", "reputation"] })
export default class RepCommand extends MandrocCommand {
  public *args() {
    const method = yield {
      default: "view",
      type: [
        ["rep-add", "add", "+"],
        ["rep-remove", "remove", "-"],
        ["rep-view", "view", "v"],
      ],
    };

    return Flag.continue(method);
  }
}
