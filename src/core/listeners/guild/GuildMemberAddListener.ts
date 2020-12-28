import { Embed, IDs, listener, Redis } from "@lib";
import { Listener } from "discord-akairo";

import type { GuildMember, User } from "discord.js";
import { AntiRaid } from "../../../lib/administrative/automation/modules/AntiRaid";

@listener("guild-member-add", { event: "guildMemberAdd", emitter: "client" })
export default class GuildMemberAddListener extends Listener {
  async exec(member: GuildMember) {
    if (member.partial) {
      await member.fetch(true);
    }

    if (AntiRaid.onGoingRaid) {
      return await AntiRaid.raidKick([member]);
    }

    AntiRaid.recentJoins.push(member);

    await member.roles.add(IDs.Unverified);
    const roles = await Redis.get().client.lrange(
      `member.${member.id}:roles`,
      0,
      -1
    );
    if (roles.length) {
      if (roles.includes(IDs.MUTED)) {
        await this.client.moderation.ban({
          offender: member,
          moderator: "automod",
          reason: "Mute Evasion",
        });

        return;
      }

      await member.roles.add(roles);
      await Redis.get().client.del(`member.${member.id}:roles`);
    }

    const projections = await this.client.channels.fetch(IDs.PROJECTIONS);
    if (projections.type !== "text") {
      return;
    }

    await (projections as any).send(
      Embed.Primary(this.joinMessage(member.user))
    );
  }

  joinMessage(user: User) {
    const messages = [
      `**${user.tag}** joined the party.`,
      `**${user.tag}** is here.`,
      `Welcome, **${user.tag}**. We hope you brought pizza.`,
      `A wild **${user.tag}** appeared.`,
      `**${user.tag}** just landed.`,
      `**${user.tag}** just slid into the server.`,
      `**${user.tag}** just showed up!`,
      `Welcome **${user.tag}**. Say hi!`,
      `**${user.tag}** hopped into the server.`,
      `Everyone welcome **${user.tag}**!`,
      `Glad you're here, **${user.tag}**.`,
      `Good to see you, **${user.tag}**.`,
      `Yay you made it, **${user.tag}**!`,
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  }
}
