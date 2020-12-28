import { Listener } from "discord-akairo";
import { Embed, IDs, listener } from "@lib";
import type { GuildMember, User } from "discord.js";

@listener("guild-member-update", {
  event: "guildMemberUpdate",
  emitter: "client",
})
export class GuildMemberUpdate extends Listener {
  async exec(old: GuildMember, member: GuildMember) {
    // "Muted" role was removed
    if (old.roles.cache.has(IDs.MUTED) && !member.roles.cache.has(IDs.MUTED)) {
      const audit = await member.guild.fetchAuditLogs().then((a) => a.entries),
        entry = audit
          .sort((a, b) => b.createdTimestamp - a.createdTimestamp)
          .filter((e) => (e.target as User).id === member.id)
          .first();

      if (!entry || entry.executor.id === this.client.user!.id) {
        return;
      }

      await this.client.moderation.unmute(
        {
          offender: member,
          moderator: entry.executor,
          reason: "unknown",
        },
        false
      );

      return;
    }

    // "Muted" role was added
    if (!old.roles.cache.has(IDs.MUTED) && member.roles.cache.has(IDs.MUTED)) {
      const audit = await member.guild.fetchAuditLogs({
          type: "MEMBER_ROLE_UPDATE",
        }),
        entry = audit.entries
          .sort((a, b) => b.createdTimestamp - a.createdTimestamp)
          .filter((e) => (e.target as User).id === member.id)
          .first();

      if (!entry || entry.executor.id === this.client.user!.id) {
        return;
      }

      await this.client.moderation.mute({
        offender: member,
        moderator: entry.executor,
        reason: "unknown",
      });

      return;
    }

    const newRoles = member.roles.cache.filter(
      (r) => !old.roles.cache.has(r.id)
    );
    if (newRoles.size) {
      const audit = await member.guild.fetchAuditLogs({
          type: "MEMBER_ROLE_UPDATE",
        }),
        entry = audit.entries
          .sort((a, b) => b.createdTimestamp - a.createdTimestamp)
          .filter((e) => (e.target as User).id === member.id)
          .first();

      if (!entry) {
        return;
      }

      const logs = await this.client.moderation.logChannel(),
        embed = Embed.Primary()
          .setAuthor("Role Add", entry.executor.displayAvatarURL())
          .setDescription([
            `**Member:** ${member} \`(${member.id})\``,
            `**Moderator:** ${entry.executor} \`(${member.id})\``,
          ]);

      await logs.send(embed);
    }
  }
}
