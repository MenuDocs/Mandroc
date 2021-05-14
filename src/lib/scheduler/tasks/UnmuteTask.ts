import { IDs, Color, Database } from "@lib";
import { MessageEmbed } from "discord.js";

import type { Mandroc } from "lib/Client";
import type { ScheduledTask } from "./ScheduledTask";

export class UnmuteTask implements ScheduledTask<UnmuteMeta> {
  readonly name = "unmute";
  async execute(client: Mandroc, { caseId: _cid, offenderId }: UnmuteMeta) {
    const guild = client.guilds.cache.get(IDs.GUILD);
    if (!guild) {
      return client.log.warn("no cached guilds?", "unmute task");
    }

    const member = guild.members.cache.get(offenderId);
    if (member && member.roles.cache.has(IDs.MUTED)) {
      await member.roles.remove(IDs.MUTED);

      try {
        /* set infraction to finished */
        await Database.PRISMA.infraction.update({
          where: { id: +_cid },
          data: {
            meta: { finished: true }
          }
        });
      } catch {
        // no-op
      }

      const embed = new MessageEmbed()
        .setColor(Color.Warning)
        .setAuthor(
          `Moderation: Unmute (Case: ${_cid})`,
          member?.user.displayAvatarURL({ dynamic: true, format: "png" })
        )
        .setTimestamp(Date.now())
        .setDescription([
          `**Moderator**: ${client.user}`,
          `**Offender**: ${
            member ? member : `unknown#0000`
          } \`(${offenderId})\``,
          `**Reason**: Temporary Action Expired.`
        ]);

      const channel = await client.moderation.logChannel();
      await channel.send(embed);
    }
  }
}

export interface UnmuteMeta {
  offenderId: string;
  caseId: number;
}
