/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { command, Embed, MandrocCommand, Profile } from "@lib";

import type { GuildMember, Message } from "discord.js";

@command("rep-view", {
  channel: "guild",
  args: [
    {
      id: "member",
      type: "member",
      default: (m: Message) => m.member,
    },
  ],
})
export default class ViewSubCommand extends MandrocCommand {
  public async exec(message: Message, { member }: args) {
    const profile =
      (await Profile.findOne({ where: { userId: member.id } })) ??
      (await Profile.create({ userId: member.id }).save());

    if (!profile.repBy.length) {
      const embed = Embed.Primary(
        "Wow, you don't have any reputation. Smh loser."
      );
      return message.util?.send(embed);
    }

    const users = new Map<string, number>();
    for (const id of profile.repBy) {
      let user = users.get(id);
      if (!user) {
        users.set(id, 0);
        continue;
      }

      user++;
    }

    let desc = "";
    for (const [userId, amount] of users) {
      const user = await this.client.users.fetch(userId);
      desc += `**${user.username}**: ${amount.toLocaleString()}\n`;
    }

    return message.util?.send(desc);
  }
}

type args = {
  member: GuildMember;
};
