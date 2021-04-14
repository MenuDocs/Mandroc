import { Listener } from "discord-akairo";
import { IDs, listener, Redis } from "@lib";

import type { GuildMember } from "discord.js";

@listener("guild-member-remove", {
  emitter: "client",
  event: "guildMemberRemove"
})
export class GuildMemberRemoveListener extends Listener {
  static PERSISTENT_ROLES = [IDs.MUTED, ...Object.values(IDs.LEVELS)];

  static async getPersistentRoles(user?: string) {
    let roles = [...this.PERSISTENT_ROLES];
    if (user) {
      const personalized = await Redis.get().client.lrange(
        `config.persistent-roles:${user}`,
        0,
        -1
      );
      roles = roles.concat(personalized);
    }

    const global = await Redis.get().client.lrange(
      "config.persistent-roles",
      0,
      -1
    );
    return [...roles, ...global];
  }

  async exec(member: GuildMember) {
    if (member.partial) {
      await member.fetch(true);
    }

    const roles = (
      await GuildMemberRemoveListener.getPersistentRoles(member.id)
    ).filter(id => member.roles.cache.has(id));

    if (roles.length) {
      await Redis.get().client.lpush(`member.${member.id}:roles`, ...roles);
    }
  }
}
