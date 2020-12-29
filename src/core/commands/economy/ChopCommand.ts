/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { command, Embed, MandrocCommand, PermissionLevel, Profile } from "@lib";
import type { Message } from "discord.js";
import ms from "ms";

@command("chop", {
  aliases: ["chop"],
  description: {
    content: "Chops trees.",
    examples: (prefix: string) => [`${prefix}chop`],
    usage: "",
  },
})
export default class ChopCommand extends MandrocCommand {
  public async exec(message: Message) {
    const profile =
      (await Profile.findOne({ _id: message.author.id })) ??
      (await Profile.create({ _id: message.author.id }));

    const logs = ["Oak", "Birch", "Apple", "Pine"].shuffle();


    if (!profile.inventory.find(x => x.name === "Axe")) {
      return message.util?.send(Embed.Warning("You must possess an axe to run this command."));
    }

    if (profile.lastChopped && profile.lastChopped < Date.now() + ms("25m")) {
      return message.util?.send(Embed.Warning("You can only access this command every 25 minutes."));
    }

    const generateAmount = () => [...Array(10).keys()].slice(1).shuffle();

    const [one, two, three, four] = generateAmount();
    const logAmounts = [one, two, three, four];


    const chance = [false, false, false, false, true];
    if (message.member?.permissionLevel === PermissionLevel.DONATOR) chance.push(true);

    if (chance.random()) {
      const earned = eval(logAmounts.map(x => x*8).join("+"));
      profile.pocket += earned;
      await profile.save();
      message.util?.send(Embed.Success(`Wow! You got ${logs.map((x,i) => `${logAmounts[i]} ${x} `).join("logs, ")} logs, and earned **${earned * 8} ₪**`))
    } else {
      message.util?.send(Embed.Warning("Yikes. The forest you went to burnt down, and it's too late to go to another."))
    }
  }
}