/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { adminCommand, MandrocCommand, Profile } from "@lib";

import type { Message } from "discord.js";
import type { User } from "discord.js";

@adminCommand("block", {
  editable: false,
  permissionLevel: 6,
  args: [
    {
      id: "target",
      type: "user",
      prompt: {
        start: "Please provide a user to block.",
        retry: "I need a user to block.",
      },
    },
  ],
})
export default class BlockCommand extends MandrocCommand {
  async exec(message: Message, { target }: args) {
    const targetProfile = await Profile.findOneOrCreate({
      where: { _id: target.id },
      create: { _id: target.id },
    });

    if (targetProfile.blocked)
      return message.channel.send("This user is already blocked.");

    targetProfile.blocked = true;

    message.channel.send(`**${target.tag}** was blocked!`);
  }
}

type args = {
  target: User;
};
