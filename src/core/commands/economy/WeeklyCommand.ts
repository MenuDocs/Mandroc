import { command, Database, Embed, MandrocCommand } from "@lib";
import ms from "ms";

import type { Message } from "discord.js";

@command("weekly", {
  aliases: [ "weekly" ],
  description: {
    content: "Pays a minor amount of credits, to help you get by ;)",
    examples: (prefix: string) => [ `${prefix}weekly` ],
    usage: ""
  }
})
export default class DailyCommand extends MandrocCommand {
  async exec(message: Message) {
    const profile = await message.member?.getProfile()!,
      date = Date.now();

    if (profile.lastWeekly) {
      const lastWeekly = profile.lastWeekly;
      if (lastWeekly < date + ms("1d")) {
        const embed = Embed.Warning(
          "You can only get a your weekly coins once a week!"
        );
        return message.util?.send(embed);
      }
    }

    const embed = Embed.Warning("Your weekly **2000 ₪** has been added to your pocket.");
    await message.util?.send(embed);

    /* update author's pocket */
    await Database.PRISMA.profile.update({
      where: { id: profile.id },
      data: {
        pocket: {
          increment: 2000
        },
        lastWeekly: Date.now()
      }
    });
  }
}
