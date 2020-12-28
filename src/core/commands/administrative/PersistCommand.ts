/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { adminCommand, Embed, MandrocCommand } from "@lib";
import { GuildMemberRemoveListener } from "../../listeners/guild/GuildMemberRemoveListener";

import type { GuildMember, Message, Role } from "discord.js";

const KEY = "config.persistent-roles";

// shit code below
@adminCommand("persist", {
  aliases: ["persist"],
  description: {
    content:
      "Toggles a role's ability to persist when a member with it leaves.",
    usage: "<role> [member]",
    examples: (prefix: string) => [
      `${prefix}persist muted`,
      `${prefix}persist "lower management" 2D`,
    ],
  },
  args: [
    {
      id: "role",
      type: "role",
      prompt: {
        start: "You must provide a valid role to be persisted.",
        retry: "Provide a valid role to be persisted.",
      },
    },
    {
      id: "member",
      type: "member",
    },
  ],
})
export class PersistCommand extends MandrocCommand {
  get redis() {
    return this.client.redis.client;
  }

  async exec(message: Message, { role, member }: args) {
    if (GuildMemberRemoveListener.PERSISTENT_ROLES.includes(role.id)) {
      const embed = Embed.Danger(
        `The role ${role} can't be toggled, as they are hard-coded... lol`
      );
      return message.util?.send(embed);
    }

    const logs = await this.client.moderation.logChannel(),
      embed = Embed.Primary();

    let has;
    if (!member) {
      has = (await this.redis.lrange(KEY, 0, -1)).includes(role.id);
      embed.setDescription(
        `${has ? "Removed" : "Added"} ${role} ${
          has ? "from" : "to"
        } the list of persisted roles.`
      );
      await this.persist(has, role.id, KEY);
    } else {
      has = (await this.redis.lrange(`${KEY}:${member.id}`, 0, -1)).includes(
        role.id
      );
      embed.setDescription(
        `${has ? "Removed" : "Added"} ${role} ${
          has ? "from" : "to"
        } **${member}'s** list of persisted roles.`
      );
      await this.persist(has, role.id, `${KEY}:${member.id}`);
    }

    const log = Embed.Primary()
      .setAuthor("Role Persistence", message.author.displayAvatarURL())
      .setDescription(
        [
          `**Role:** ${role} \`(${role.id})\``,
          member ? `**Member:** ${member} \`(${member.id})\`` : false,
          `**Moderator:** ${message.author} \`(${message.author.id})\``,
          `**Persisted:** ${!has}`,
        ].filter(Boolean)
      )
      .setTimestamp();

    await logs.send(log);
    return message.util?.send(embed);
  }

  persist(includes: boolean, role: string, key: string) {
    return includes
      ? this.redis.lrem(key, 0, role)
      : this.redis.lpush(key, role);
  }
}

type args = {
  role: Role;
  member: GuildMember;
};
