/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { command, Embed, MandrocCommand } from "@lib";
import ms from "ms";

import type { Message } from "discord.js";

@command("daily", {
  aliases: ["daily"],
  channel: "guild",
  description: {
    content: "Pays a minor amount of credits, to help you get by ;)",
    examples: (prefix: string) => [`${prefix}daily`],
    usage: "!daily",
  },
})
export default class DailyCommand extends MandrocCommand {
  async exec(message: Message) {
    const profile = await message.member!.getProfile();
    if (profile.lastDaily && profile.lastDaily + ms("1d") > Date.now()) {
      const embed = Embed.Primary(
        `Ayo! It's only been **${ms(profile.lastDaily, {
          long: true,
        })}** since you last got your daily coins, chill.`
      );
      return message.util?.send(embed);
    }

    const embed = Embed.Warning(
      "Your daily **200 ₪** has been added to your pocket."
    );
    profile.pocket += 200;
    profile.lastDaily = Date.now();

    await profile.save();
    await message.util?.send(embed);
  }
}
