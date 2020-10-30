import { command, Embed, MandrocCommand, Profile } from "@lib";

import type { GuildMember, Message } from "discord.js";
import ms from "ms";

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
export default class AddSubCommand extends MandrocCommand {
  public async exec(message: Message, { member }: args) {
    const profile =
      (await Profile.findOne({ where: { userId: member.id } })) ??
      (await Profile.create({ userId: member.id }).save());

    profile.repBy.push(message.author.id);
    return message.util?.send(
      Embed.Primary(`Successfully added **1** reputation to ${member}`)
    );
  }
}

type args = {
  member: GuildMember;
};
