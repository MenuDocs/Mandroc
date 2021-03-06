import { Color, IDs, Mandroc, Database } from "@lib";
import { MessageEmbed } from "discord.js";

import type { ScheduledTask } from "./ScheduledTask";

export class UnbanTask implements ScheduledTask<UnbanMeta> {
  readonly name = "unban";

  async execute(client: Mandroc, {
    caseId: _cid,
    offenderId
  }: UnbanMeta) {
    try {
      /* set infraction to finished. */
      await Database.PRISMA.infraction.update({
        where: { id: +_cid },
        data: {
          meta: {
            finished: true
          }
        }
      });
    } catch {
      return;
    }

    const guild = client.guilds.cache.get(IDs.GUILD);
    if (!guild) {
      return client.log.warn("no cached guilds?", "unban task");
    }

    const user = await client.users.fetch(offenderId);
    await guild.members.unban(offenderId);

    const embed = new MessageEmbed()
      .setColor(Color.Danger)
      .setAuthor(`Moderation: Unban (Case: ${_cid})`, user.displayAvatarURL())
      .setTimestamp(Date.now())
      .setDescription([
        `**Moderator:** ${client.user}`,
        `**Offender:** ${user.tag} \`(${offenderId})\``,
        `**Reason:** Temporary Action Expired.`
      ]);

    const channel = await client.moderation.logChannel();
    await channel.send(embed);
  }
}

export interface UnbanMeta {
  offenderId: string;
  caseId: number;
}
