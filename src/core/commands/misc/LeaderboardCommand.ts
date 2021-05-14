import { command, Database, Embed, MandrocCommand, paginate } from "@lib";
import type { Message } from "discord.js";

@command("leaderboard", {
  aliases: ["leaderboard", "top"],
  description: {
    content: "Displays bot info",
    examples: (prefix: string) => [`${prefix}leaderboard`]
  },
  args: [
    {
      id: "type",
      type: [
        ["xp", "exp"],
        ["level", "lvl"]
      ],
      default: "xp"
    },
    {
      id: "page",
      type: "number",
      default: 1,
      match: "option",
      flag: ["--page", "-p", "--select"]
    }
  ]
})
export class LeaderboardCommand extends MandrocCommand {
  public async exec(message: Message, { page: _current, type }: args) {
    const profiles = await Database.PRISMA.profile.findMany({
      orderBy: {
        [type]: "asc"
      }
    })

    const { max, page, current } = paginate(profiles, 10, _current);

    let idx = (current - 1) * 10,
      desc = "";

    for (const profile of page) {
      const user = await this.client.users.fetch(profile.id);

      desc += `\`#${`${++idx}`.padStart(2, "0")}\` *${user.tag}*\n`;
      desc += `\u3000**${type.capitalize()}:** ${profile[type].toLocaleString()}\n\n`;
    }

    const embed = Embed.primary(desc);
    if (max > 1) {
      embed.setFooter(`Page: ${current}/${max}`);
    }

    return message.util?.send(embed);
  }
}

type args = {
  page: number;
  type: "xp" | "level";
};
