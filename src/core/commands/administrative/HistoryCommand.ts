import { adminCommand, Database, Embed, MandrocCommand } from "@lib";
import moment from "moment";

import type { Message, User } from "discord.js";

@adminCommand("history", {
  aliases: [ "history" ],
  args: [
    {
      id: "target",
      type: "user",
      prompt: {
        start: "Please provide a user to search.",
        retry: "I need a user to search."
      }
    }
  ]
})
export default class HistoryCommand extends MandrocCommand {
  public async exec(message: Message, { target }: args) {
    const infractions = await Database.PRISMA.infraction.findMany({
        where: { offenderId: target.id },
        orderBy: { createdAt: "desc" }
      }),
      embed = Embed.Primary().setAuthor(`Infraction History: ${target.tag}`);

    for (const infraction of infractions) {
      embed.addField(
        `*${infraction.type.capitalize()} | ${moment(
          infraction.createdAt
        ).format("L LT")}*`,
        infraction.reason
      );
    }
    return message.channel.send(embed);
  }
}

type args = {
  target: User;
};
