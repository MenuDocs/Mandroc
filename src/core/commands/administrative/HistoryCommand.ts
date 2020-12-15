/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { adminCommand, MandrocCommand, Infraction, Color } from "@lib";
import { MessageEmbed } from "discord.js";
import type { User, Message } from "discord.js";
import moment from "moment";

@adminCommand("warn", {
  aliases: ["warn"],
  editable: false,
  args: [
    {
      id: "target",
      type: "user",
      prompt: {
        start: "Please provide a user to search.",
        retry: "I need a user to search.",
     },
    }
  ],
})
export default class HistoryCommand extends MandrocCommand {
  public async exec(message: Message, { target }: args) {
    const infractions = await Infraction.find({where: {offender: target.id}});
    const embed = new MessageEmbed().setColor(Color.Primary).setAuthor(`Infraction History: ${target.tag}`);
    for (const infraction of infractions) {
        embed.addField(`*${infraction.type.capitalize()} | ${moment(infraction.createdAt).format("L LT")}*`, infraction.reason)
    }
    return message.channel.send(embed);
  }
}

type args = {
  target: User;
};
