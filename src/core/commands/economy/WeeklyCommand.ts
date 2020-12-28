/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { command, Embed, MandrocCommand } from "@lib";
import ms from "ms";

import type { Message } from "discord.js";

@command("weekly", {
  aliases: ["weekly"],
  description: {
    content: "Pays a minor amount of credits, to help you get by ;)",
    examples: (prefix: string) => [`${prefix}weekly`],
    usage: "",
  },
})
export default class DailyCommand extends MandrocCommand {
  async exec(message: Message) {
    const profile = await message.member?.getProfile()!,
      date = Date.now();

    if (profile.lastDaily) {
      const lastDaily = profile.lastDaily;

      if (lastDaily < date + ms("1d")) {
        const embed = Embed.Warning(
          "You can only get a your weekly coins once a week.!"
        );
        return message.util?.send(embed);
      }
    }

    const embed = Embed.Warning(
      "Your weekly **2000₪** has been added to your pocket."
    );
    profile.pocket += 200;
    profile.lastWeekly = date;

    await profile.save();
    await message.util?.send(embed);
  }
}
