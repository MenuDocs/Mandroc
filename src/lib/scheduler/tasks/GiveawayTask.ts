/*
 * Copyright (c) MenuDocs 2021.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { Embed } from "../../util/Embed";

import type { TextChannel } from "discord.js";
import type { ScheduledTask } from "./ScheduledTask";
import type { Mandroc } from "../../Client";

export class GiveawayTask implements ScheduledTask<GiveawayMeta> {
  /**
   * The default emoji to use.
   */
  static EMOJI = "🎉";

  name: string = "giveaway";

  async execute(client: Mandroc, {
    channelId,
    messageId,
    amount,
  }: GiveawayMeta, _: any) {
    const channel = await client.channels.fetch(channelId, false) as TextChannel,
      message = await channel.messages.fetch(messageId, false);

    if (!message) {
      return;
    }

    const reactions = message.reactions.cache.get(GiveawayTask.EMOJI),
      potentialWinners = await reactions?.users.fetch();
    if (!potentialWinners?.size) {
      const embed = Embed.Primary("It seems that no one wanted the prize...");
      return message.util?.send(embed);
    }

    const winners = potentialWinners.randomAmount(+amount),
      winnersString = winners.length > 1
        ? winners[0].toString()
        : winners
          .map((usr, idx, arr) => idx === 0 ? `${usr}` : `, ${idx === arr.length - 1 ? "and " : ""}${usr}`)
          .join("")
          .trim();

    const embed = Embed.Primary(`And the winner${winners.length > 1 ? "s are" : "is"}...\n${winnersString}`);
    message.util?.send(embed);
  }
}

export interface GiveawayMeta {
  channelId: string;
  messageId: string;
  emoji: string;
  amount: number;
}