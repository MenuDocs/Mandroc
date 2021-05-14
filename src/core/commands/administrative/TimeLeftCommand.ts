import { command, Embed, MandrocCommand, PermissionLevel, ScheduledTaskInfo, Scheduler } from "@lib";

import type { GuildMember, Message } from "discord.js";
import ms from "ms";

@command("timeleft", {
  aliases: [ "time-left", "tl" ],
  description: {
    content: "Returns the time left on an infraction.",
    examples: (prefix: string) => [
      `${prefix}timeleft`,
      `${prefix}timeleft @T3NED#0001`
    ],
    usage: "[member]"
  },
  args: [
    {
      id: "member",
      type: "member"
    }
  ]
})
export default class TimeLeftCommand extends MandrocCommand {
  async exec(message: Message, { member }: args) {
    const mod = message.member?.above(PermissionLevel.TrialMod);
    if (mod && !member) {
      const embed = Embed.warning("I don't think you know how this works...");
      return message.util?.send(embed);
    }

    return await this.respond(message, mod ? member.id : message.author.id);
  }

  private async respond(message: Message, id: string) {
    const [ key ] = await this.client.redis.scan(`tasks:*.${id}`);
    if (!key) {
      const embed = Embed.warning("Please provide a punished user.");
      return message.util?.send(embed);
    }

    const data = ((await this.client.redis.client.hgetall(key)) as unknown) as ScheduledTaskInfo,
      { task } = Scheduler.parse(key)!;

    if (!data || ![ "unban", "unmute" ].includes(task)) {
      const embed = Embed.warning("No on-going bans on mutes.");
      return message.util?.send(embed);
    }

    // if (!data.metaKey) {
    //   const embed = Embed.Warning("Found malformed unmute/unban task, deleting...");
    //   await Redis.get().client.del(key);
    //
    //   return message.util?.send(embed);
    // }

    const embed = Embed.primary(`<@${id}> \`(${id})\` has **${ms(+data.runAt - Date.now(), { long: true })}** remaining for their **${task}**.`);
    return message.util?.send(embed);
  }
}

type args = {
  member: GuildMember;
};
