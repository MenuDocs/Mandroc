import { adminCommand, Embed, Infraction, MandrocCommand } from "@lib";
import type { Message, User } from "discord.js";
import moment from "moment";

@adminCommand("history", {
  aliases: ["history"],
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
    const infractions = await Infraction.find({
        where: { offenderId: target.id },
        order: { createdAt: "DESC" }
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
