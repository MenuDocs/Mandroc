import { command, Embed, MandrocCommand, PermissionLevel, Tag } from "@lib";
import type { Message, Role } from "discord.js";

@command("tag-restrict", { permissionLevel: PermissionLevel.TRIAL_MOD })
export default class RestrictSubCommand extends MandrocCommand {
  public async exec(message: Message, { tag, method, roles }: args) {
    switch (method) {
      case "roles":
        const changed: { id: string; removed: boolean }[] = [];
        for (let role of roles) {
          const i = tag.perms.roles.indexOf(role.id);
          if (i !== -1) {
            changed.push({ id: role.id, removed: true });
            tag.perms.roles.splice(i, 1);
          } else {
            changed.push({ id: role.id, removed: false });
            tag.perms.roles.push(role.id);
          }
        }

        const adj = (c: Dictionary) => (c.removed ? "removed" : "added"),
          embed = Embed.Primary(
            changed.map((c) => `**<@&${c.id}>**: ${adj(c)}`)
          );

        await message.util?.send(embed);
        break;
      case "staff": {
        const sen = (tag.perms.staffOnly = !tag.perms.staffOnly)
          ? "now"
          : "no longer";

        await message.util?.send(
          Embed.Primary(
            `The tag, **${tag.name}**, is ${sen} restricted to staff.`
          )
        );
        break;
      }
      case "support":
        const sen = (tag.perms.supportOnly = !tag.perms.supportOnly)
          ? "now"
          : "no longer";

        await message.util?.send(
          Embed.Primary(
            `The tag, **${tag.name}**, is ${sen} restricted to support channels.`
          )
        );
        break;
    }

    return tag.save();
  }

  public *args() {
    const tag = yield {
      type: "tag",
      prompt: {
        start: "Please provide a tag to restrict.",
      },
    };

    const method = yield {
      type: ["staff", "support", "roles"],
    };

    let roles;
    if (method === "roles") {
      roles = yield {
        type: "role",
        match: "separate",
        prompt: {
          start: "Please provide some roles to restrict the tag to.",
        },
      };
    }

    return roles ? { tag, method, roles } : { tag, method };
  }
}

type args = {
  tag: Tag;
  method: "staff" | "support" | "roles";
  roles: Role[];
};
