/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { command, Embed, MandrocCommand } from "@lib";
import ms from "ms";

import type { Message } from "discord.js";

@command("work", {
  aliases: [ "work" ],
  description: {
    content: "Allows you to work",
    examples: (prefix: string) => [ `${prefix}weekly` ],
    usage: "!work",
  },
})
export default class DailyCommand extends MandrocCommand {
  private stories = (hourlyPay: number, hours: number) => [
    `You worked at the local pizza place for **${hours}** hour and earned **${hourlyPay} ₪** an hour`,
    `You made a sellout. You sold for **${hours}** hours and earned approx **${hourlyPay} ₪** an hour`,
    `You just got hired at the local grill bar. Your first day, today, you worked for **${hourlyPay} ₪** an hour and worked for **${hours}**`,
  ];

  async exec(message: Message) {
    const profile = await message.member?.getProfile()!;
    if (profile.lastDaily && profile.lastDaily + ms("12h") > Date.now()) {
      return message.util?.send(Embed.Warning("You can only work once every 12 hours."));
    }

    const [ hourlyPay, hours ] = [ ...Array(10).keys() ].slice(1).shuffle();
    profile.lastWorked = Date.now();
    profile.pocket += hourlyPay * hours;

    await message.util?.send(Embed.Primary(this.stories(hourlyPay, hours).random()));
    await profile.save();
  }
}
