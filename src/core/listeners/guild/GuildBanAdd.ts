import { Database, listener, Mandroc, ModLog } from "@lib";
import { InfractionType } from "@prisma/client";
import { Listener } from "discord-akairo";

import type { User, Guild } from "discord.js";

@listener("guild-ban-add", { event: "guildBanAdd", emitter: "client" })
export class GuildBanAddListener extends Listener {
  async exec(guild: Guild, user: User) {
    const moderated = await Database.PRISMA.infraction.findFirst({
      where: {
        offenderId: user.id,
        type: InfractionType.Ban
      },
      orderBy: {
        id: "desc"
      }
    });

    if (moderated) {
      return;
    }

    const auditLogs = await guild.fetchAuditLogs({
      type: "MEMBER_BAN_ADD",
      limit: 10
    });

    const auditLog = auditLogs.entries.first();
    if (!auditLog) {
      return;
    }

    await new ModLog(this.client as Mandroc)
      .setType(InfractionType.Ban)
      .setOffender(user)
      .setModerator(auditLog.executor)
      .setReason(auditLog.reason ?? "none")
      .finish();
  }
}
