/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */
// @ts-ignore
import { adminCommand, MandrocCommand, Profile } from "@lib";

import type { Message } from "discord.js";
import type { User } from "discord.js";

@adminCommand("watchlist", {
  aliases: ["watchlist"],
  editable: false,
  args: [
    {
      id: "target",
      type: "member",
      prompt: {
        start: "Please provide a user to kick.",
        retry: "I need a user to kick.",
      },
    },
    {
      id: "reason",
      match: "rest",
      prompt: {
        start: "Please provide a reason for this kick.",
        retry: "I need a reason for this kick.",
      },
    },
  ],
})
export default class KickCommand extends MandrocCommand {
  async exec(_: Message, {  }: args) {
    //Profile.if();
  }
}

type args = {
  action?: "add" | "remove" | "list";
  user?: User;
  note?: string;
};
