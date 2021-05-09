import { command, Database, Embed, MandrocCommand } from "@lib";
import ms from "ms";

import type { Message } from "discord.js";

@command("daily", {
  aliases: [ "daily" ],
  channel: "guild",
  description: {
    content: "Pays a minor amount of credits, to help you get by ;)",
    examples: (prefix: string) => [ `${prefix}daily` ],
    usage: "!daily"
  }
})
export default class DailyCommand extends MandrocCommand {
  async exec(message: Message) {
    const profile = await message.member!.getProfile();

    /* check for last daily. */
    if (profile.lastDaily && profile.lastDaily + ms("1d") > Date.now()) {
      const rem = ms(Date.now() - profile.lastDaily, { long: true }),
        embed = Embed.primary(`Ayo! It's only been **${rem}** since you last got your daily coins, chill.`);

      return message.util?.send(embed);
    }

    /* send daily message. */
    const embed = Embed.warning("Your daily **200 ₪** has been added to your pocket.");
    message.util?.send(embed);

    /* update profile */
    await Database.PRISMA.profile.update({
      where: { id: profile.id },
      data: {
        pocket: {
          increment: 200
        },
        lastWeekly: Date.now()
      }
    });
  }
}
