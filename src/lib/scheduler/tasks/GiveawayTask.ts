/*
 * Copyright (c) MenuDocs 2021.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import moment from "moment";
import { Embed } from "../../util/Embed";

import type { TextChannel } from "discord.js";
import type { ScheduledTask } from "./ScheduledTask";
import type { Mandroc } from "../../Client";
import { config } from "@lib";

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
    prize,
  }: GiveawayMeta, _: any) {
    const channel = await client.channels.fetch(channelId, false) as TextChannel,
      message = await channel.messages.fetch(messageId, false);

    if (!message) {
      return;
    }

    const reactions = message.reactions.cache.get(GiveawayTask.EMOJI),
      potentialWinners = (await reactions?.users?.fetch())?.filter(u => !u.bot);

    const newEmbed = Embed.Primary(`Giveaway ended at **${moment().format("L LT")}**`)
      .setTimestamp(Date.now())
      .setTitle(`\`${prize}\``);

    await reactions?.remove();
    await message.edit(newEmbed);

    if (!potentialWinners?.size) {
      const embed = Embed.Primary("It seems that no one wanted the prize...");
      return message.channel?.send(embed);
    }

    const winners = potentialWinners.filter(u => u.id !== client.user!.id).randomAmount(+amount),
      prefix = `${config.get("giveaways.mention-everyone")}` === "true" ? "@everyone, t" : "T";

    newEmbed.setFooter(`${winners.size} winner${winners.size !== 1 ? "s" : ""}`);
    await message.channel.send(`${prefix}ge **${prize}** winner${winners.size === 1 ? " is" : "s are"}... ${winners.array()
      .format()}`);
  }
}

export interface GiveawayMeta {
  channelId: string;
  messageId: string;
  emoji: string;
  amount: number;
  prize: string;
}
