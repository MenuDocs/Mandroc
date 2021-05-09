import moment from "moment";
import { config, Embed, ScheduledTaskInfo, Scheduler, TASK } from "@lib";
import { GiveawayTask } from "../scheduler/tasks/GiveawayTask";

import type { Message } from "discord.js";

export abstract class Giveaway {
  static async create(
    message: Message,
    duration: number,
    prize: string,
    winners: number = 1
  ): Promise<string> {
    const end = Date.now() + duration,
      id = Scheduler.generateRandomId(),
      msg = await message.util?.send(
        `${config.get("giveaways.mention-everyone")}` === "true"
          ? "@everyone"
          : "",
        Embed.primary([
          `React with **${GiveawayTask.EMOJI}** to win \`${prize}\`!`,
          `Ends at **${moment(end).format("L LT")}**`
        ])
          .setFooter(`${id} • ${winners} potential winners`)
          .setTimestamp(end)
      );

    await msg!.react(GiveawayTask.EMOJI);
    await Scheduler.get().schedule("giveaway", end, id, {
      emoji: GiveawayTask.EMOJI,
      messageId: msg!.id,
      channelId: message.channel.id,
      amount: winners,
      prize
    });

    return id;
  }

  static async exists(id: string): Promise<boolean> {
    const key = TASK("giveaway", id);
    return (await Scheduler.redis.client.exists(key)) > 0;
  }

  /**
   * Ends an on-going giveaway.
   *
   * @param id The Giveaway ID.
   *
   * @returns Whether the giveaway was ended.
   */
  static async end(id: string): Promise<boolean> {
    if (!(await this.exists(id))) {
      return false;
    }

    const key = TASK("giveaway", id),
      data: ScheduledTaskInfo = (await Scheduler.redis.client.hgetall(
        key
      )) as any;

    await Scheduler.get()._runKey(key, data);
    return true;
  }
}
