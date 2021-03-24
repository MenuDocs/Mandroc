/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { command, Embed, MandrocCommand } from "@lib";
import ms from "ms";

import type { GuildMember, Message } from "discord.js";

@command("rep-add", {
  channel: "guild",
  args: [
    {
      id: "member",
      type: "member",
    },
  ],
  cooldown: ms("1d"),
})
export class RepAddSubCommand extends MandrocCommand {
  public async exec(message: Message, { member }: args) {
    const profile = await message.member!.getProfile();

    profile.repBy.push(message.author.id);
    return message.util?.send(
      Embed.Primary(`Successfully added **1** reputation to ${member}`)
    );
  }
}

type args = {
  member: GuildMember;
};
