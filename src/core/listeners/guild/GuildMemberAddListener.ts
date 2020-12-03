import { Embed, IDS, listener } from "@lib";
import { Listener } from "discord-akairo";
import type { User } from "discord.js";
import type { GuildMember } from "discord.js";

@listener("guild-member-add", { event: "guildMemberAdd", emitter: "client" })
export default class GuildMemberAddListener extends Listener {
  async exec(member: GuildMember) {
    if (member.partial) {
      member = await member.fetch(true);
    }

    await member.roles.add(IDS.Unverified);

    // post message.
    const projections = await this.client.channels.fetch(IDS.PROJECTIONS);
    if (!projections.isText()) {
      return;
    }

    await projections.send(Embed.Primary(this.joinMessage(member.user)))
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
      `Yay you made it, **${user.tag}**!`
    ];

    return messages[Math.floor(Math.random() * messages.length)]
  }
}