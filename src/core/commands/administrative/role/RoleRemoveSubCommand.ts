import { command, Embed, MandrocCommand } from "@lib";
import type { GuildMember, Message, Role } from "discord.js";

@command("role-remove", {
  description: {
    content: "Used for remonig a role from someone",
    usage: "<role> <member>"
  },
  args: [
    {
      id: "role",
      type: "role",
      prompt: {
        start: "You must provide a valid role to remove.",
        retry: "Provide a valid role."
      }
    },
    {
      id: "member",
      type: "member",
      prompt: {
        start: "You must provide a valid guild member.",
        retry: "Provide a valid guild member"
      }
    }
  ]
})
export class RoleAddSubCommand extends MandrocCommand {
  async exec(message: Message, { member, role }: args) {
    if (!member.roles.cache.has(role.id)) {
      const embed = Embed.warning(`${member} already doesn't have this role.`);
      return message.util?.send(embed);
    }

    await member.roles.remove(role.id);

    const embed = Embed.primary(
      `Successfully removed the role ${role} from ${member}.`
    );
    return message.util?.send(embed);
  }
}

type args = {
  member: GuildMember;
  role: Role;
};
