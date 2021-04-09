import { Module } from "../Module";

import type { Message } from "discord.js";
import { Collection, MessageEmbed } from "discord.js";
import type { AutoMod } from "../AutoMod";
import { Color } from "@lib";

export class AntiMassModeration extends Module {
  /**
   * The command buckets.
   */
  static BUCKETS = new Collection<string, number>();

  /**
   * @param automod The automod instance.
   */
  constructor(automod: AutoMod) {
    super(automod, 2);

    this.client.setInterval(() => {
      AntiMassModeration.BUCKETS.clear();
    }, 30000);
  }

  async run(message: Message): Promise<boolean> {
    const bUser = AntiMassModeration.BUCKETS.get(message.author.id);
    if (!bUser || bUser < 5) {
      return false;
    }

    const embed = new MessageEmbed()
      .setColor(Color.Warning)
      .setDescription("You've temporarily been denied from using staff commands, due to a recent over-use.");

    message.util?.send(embed);
    return true;
  }

  /**
   * Increments the amount of command invocations by a Staff Member.
   *
   * @param {Message} message
   */
  static incrementCommandUsage(message: Message) {
    AntiMassModeration.BUCKETS.set(
      message.author.id,
      (AntiMassModeration.BUCKETS.get(message.author.id) ?? 0) + 1,
    );
  }
}
