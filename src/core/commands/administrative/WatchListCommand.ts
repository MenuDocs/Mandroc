/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { adminCommand, MandrocCommand, PermissionLevel } from "@lib";

import type { Message, User } from "discord.js";

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
export default class WatchListCommand extends MandrocCommand {
  async exec(message: Message, { action, user, note }: args) {
    if (message.member?.permissionLevel! < PermissionLevel.TRIAL_MOD) {
      // return
    } else {
      if (!user) {

      }
      if (action === "list") {
        // display list of notes for user
        note
      }
    }
  }
}

type args = {
  action?: "add" | "remove" | "list";
  user?: User;
  note?: string;
};
