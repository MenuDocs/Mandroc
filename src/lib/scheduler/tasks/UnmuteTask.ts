import { Infraction, IDs, Color } from "@lib";
import { captureException } from "@sentry/node";
import { MessageEmbed } from "discord.js";

import type { Mandroc } from "lib/Client";
import type { ScheduledTask } from "./ScheduledTask";

export class UnmuteTask implements ScheduledTask<data> {
  readonly name = "unmute";
  async execute(client: Mandroc, { caseId: _cid, offenderId }: data) {
    const infraction = await Infraction.findOne({ where: { id: +_cid } });
    if (!infraction) {
      return;
    }

    const guild = client.guilds.cache.get(IDs.GUILD);
    if (!guild) {
      return client.log.warn("no cached guilds?", "unmute task");
    }

    const member = guild.members.cache.get(offenderId);
    if (member && member.roles.cache.has(IDs.MUTED)) {
      await member.roles.remove(IDs.MUTED);

      infraction.meta.finished = true;
      await infraction.save().catch(captureException);

      const embed = new MessageEmbed()
        .setColor(Color.WARNING)
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
          `**Reason**: Temporary Action Expired.`,
        ]);

      const channel = await client.moderation.logChannel();
      await channel.send(embed);
    }
  }
}

type data = {
  offenderId: string;
  caseId: string;
};
