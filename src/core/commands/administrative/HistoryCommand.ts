import { adminCommand, Database, Embed, InfractionMeta, MandrocCommand, ModLog, paginate } from "@lib";

import type { Message, User } from "discord.js";
import moment from "moment";

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
    },
    {
      id: "linkInfractions",
      flag: [ "-li", "--link-infractions" ]
    },
    {
      id: "includePardoned",
      flag: [ "-ip", "--include-pardoned" ]
    },
    {
      id: "page",
      type: "number",
      flag: [ "-p", "--page" ],
      match: "option",
      default: 1
    }
  ]
})
export default class HistoryCommand extends MandrocCommand {
  public async exec(message: Message, {
    target,
    linkInfractions,
    // includePardoned,
    page: _current
  }: args) {
    const infractions = await Database.PRISMA.infraction.findMany({
      where: { offenderId: target.id },
      orderBy: { createdAt: "desc" },
      select: {
        reason: true,
        type: true,
        createdAt: true,
        id: true,
        meta: true
      }
    });


    const {
      max,
      current,
      page
    } = paginate(infractions, 5, _current);

    let desc = "";
    for (const {
      id,
      reason: rsn,
      createdAt,
      meta,
      type
    } of page) {
      const reason = linkInfractions ? await ModLog.parseReason(rsn) : rsn;

      desc += `\`#${`${id}`.padStart(2, "0")}\` ${type} **${moment(createdAt).format("L LT")}**\n`;
      desc += `\u3000 ${reason}`;
      if ((meta as InfractionMeta).pardon) {
        desc += `\n\u3000 *pardoned*`;
      }

      desc += "\n\n";
    }

    const embed = Embed.primary(desc)
      .setAuthor(`Infraction History: ${target.tag}`);

    if (max > 1) {
      embed.setFooter(`Page: ${current}/${max}`);
    }

    return message.util?.send(embed);
  }
}

type args = {
  target: User;
  linkInfractions: boolean;
  includePardoned: boolean;
  page: number;
};
