import { Listener } from "discord-akairo";
import { GuildMember, User, Util } from "discord.js";
import { Embed, IDs, listener } from "@lib";

@listener("guild-member-update", {
  event: "guildMemberUpdate",
  emitter: "client"
})
export class GuildMemberUpdate extends Listener {
  async exec(old: GuildMember, member: GuildMember) {
    // "Muted" role was removed
    if (old.roles.cache.has(IDs.MUTED) && !member.roles.cache.has(IDs.MUTED)) {
      const audit = await member.guild.fetchAuditLogs().then(a => a.entries),
        entry = audit
          .sort((a, b) => b.createdTimestamp - a.createdTimestamp)
          .filter(e => (e.target as User).id === member.id)
          .first();

      if (!entry || entry.executor.id === this.client.user!.id) {
        return;
      }

      await this.client.moderation.unmute(
        {
          offender: member,
          moderator: entry.executor,
          reason: "unknown"
        },
        false
      );

      return;
    }

    // "Muted" role was added
    if (!old.roles.cache.has(IDs.MUTED) && member.roles.cache.has(IDs.MUTED)) {
      const audit = await member.guild.fetchAuditLogs({
          type: "MEMBER_ROLE_UPDATE"
        }),
        entry = audit.entries
          .sort((a, b) => b.createdTimestamp - a.createdTimestamp)
          .filter(e => (e.target as User).id === member.id)
          .first();

      if (!entry || entry.executor.id === this.client.user!.id) {
        return;
      }

      await this.client.moderation.mute({
        offender: member,
        moderator: entry.executor,
        reason: "unknown"
      });

      return;
    }

    if (member.nickname !== old.nickname) {
      const audit = await member.guild.fetchAuditLogs({
          type: "MEMBER_UPDATE"
        }),
        entry = audit.entries
          .sort((a, b) => b.createdTimestamp - a.createdTimestamp)
          .filter(e => (e.target as User).id === member.id)
          .first();

      if (!entry) {
        return;
      }

      const logs = await this.client.moderation.logChannel(),
        embed = Embed.Primary()
          .setAuthor(
            `Member Nickname ${
              !member.nickname ? "Reset" : !old.nickname ? "Set" : "Updated"
            }`,
            entry.executor.displayAvatarURL()
          )
          .setDescription([
            `**Member:** ${member} \`(${member.id})\``,
            `**Moderator:** ${entry.executor} \`(${entry.executor.id})\``,
            !member.nickname && old.nickname
              ? `**Old Nickname:** ${Util.escapeMarkdown(old.nickname)}`
              : member.nickname && !old.nickname
              ? `**Set Nickname:** ${Util.escapeMarkdown(member.nickname)}`
              : `**New/old Nickname:** ${Util.escapeMarkdown(
                  member.nickname!
                )} / ${Util.escapeMarkdown(old.nickname!)}`
          ]);

      await logs.send(embed);
    }

    const newRoles = member.roles.cache,
      oldRoles = old.roles.cache;

    if (newRoles.size !== oldRoles.size) {
      const addedRoles = newRoles.filter(r => !oldRoles.has(r.id)),
        removedRoles = oldRoles.filter(r => !newRoles.has(r.id));

      const audit = await member.guild.fetchAuditLogs({
          type: "MEMBER_ROLE_UPDATE"
        }),
        entry = audit.entries
          .sort((a, b) => b.createdTimestamp - a.createdTimestamp)
          .filter(e => (e.target as User).id === member.id)
          .first();

      if (!entry) {
        return;
      }

      const logs = await this.client.moderation.logChannel(),
        embed = Embed.Primary()
          .setAuthor(`Updated Member Roles`, entry.executor.displayAvatarURL())
          .setDescription(
            [
              `**Member:** ${member} \`(${member.id})\``,
              `**Moderator:** ${entry.executor} \`(${entry.executor.id})\``,
              addedRoles.size
                ? `**Added:** ${addedRoles.array().format()}`
                : "",
              removedRoles.size
                ? `**Removed:** ${removedRoles.array().format()}`
                : ""
            ].filter(Boolean)
          );

      await logs.send(embed);
    }
  }
}
