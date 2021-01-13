/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { command, Embed, MandrocCommand, PermissionLevel, ScheduledTaskInfo, Scheduler } from "@lib";

import type { GuildMember, Message } from "discord.js";

@command("timeleft", {
  aliases: [ "time-left", "tl" ],
  description: {
    content: "Returns the time left on an infraction.",
    examples: (prefix: string) => [
      `${prefix}timeleft`,
      `${prefix}timeleft @T3NED#0001`,
    ],
    usage: "[member]",
  },
  args: [
    {
      id: "member",
      type: "member",
    },
  ],
})
export default class TimeLeftCommand extends MandrocCommand {
  async exec(message: Message, { member }: args) {
    const mod = message.member?.above(PermissionLevel.TRIAL_MOD);
    if (mod && !member) {
      const embed = Embed.Warning("I don't think you know how this works...");
      return message.util?.send(embed);
    }

    return await this.respond(message, mod ? member.id : message.author.id);
  }

  private async respond(message: Message, id: string) {
    const [ key ] = await this.client.redis.scan(`tasks:*.${id}`),
      data = await this.client.redis.client.hgetall(key) as unknown as ScheduledTaskInfo,
      { task } = Scheduler.parse(key)!;

    if (!data || ![ "unban", "unmute" ].includes(task)) {
      const embed = Embed.Warning("No on-going bans on mutes.");
      return message.util?.send(embed);
    }

    const embed = Embed.Primary(`<@${id}> \`(${id})\` has **${+data.runAt}** remaining for their **${task}**.`);
    return message.util?.send(embed);
  }
}

type args = {
  member: GuildMember;
};
