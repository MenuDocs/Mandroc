/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { command, Embed, MandrocCommand } from "@lib";
import type { GuildMember, Message, Role } from "discord.js";
import { GuildMemberRemoveListener } from "../../../listeners/guild/GuildMemberRemoveListener";

@command("role-add", {
  description: {
    content: "Used for adding a role to someone",
    usage: "<role> <member> [--persist]",
  },
  channel: "guild",
  args: [
    {
      id: "role",
      type: "role",
      prompt: {
        start: "You must provide a valid role to add.",
        retry: "Provide a valid role.",
      },
    },
    {
      id: "member",
      type: "member",
      prompt: {
        start: "You must provide a valid guild member.",
        retry: "Provide a valid guild member",
      },
    },
    {
      id: "persist",
      match: "flag",
      flag: ["-p", "--persist"],
    },
  ],
})
export class RoleAddSubCommand extends MandrocCommand {
  async exec(message: Message, { member, role, persist }: args) {
    if (member.roles.cache.has(role.id)) {
      const embed = Embed.Warning(`${member} already has this role.`);
      return message.util?.send(embed);
    }

    if (role.comparePositionTo(message.member!.roles.highest) < 0) {
      const embed = Embed.Danger(`You cannot add this role to ${member}.`);
      return message.util?.send(embed);
    }

    await member.roles.add(role.id);
    if (persist) {
      const persisted = await GuildMemberRemoveListener.getPersistentRoles(member.id);
      if (!persisted.includes(role.id)) {
        await this.client.redis.client.lpush(
          `config.persistent-roles:${member.id}`,
          role.id
        );
      } else {
        persist = false;
      }
    }

    const embed = Embed.Primary(`Successfully added role ${role} to ${member}${persist ? ", the role will persist if and when they leave." : ""}`);
    return message.util?.send(embed);
  }
}

type args = {
  member: GuildMember;
  role: Role;
  persist: boolean;
};
