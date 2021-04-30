import { command, Database, Embed, MandrocCommand, PermissionLevel } from "@lib";
import type { Tag } from "@prisma/client";
import type { Message, Role } from "discord.js";

@command("tag-restrict", { permissionLevel: PermissionLevel.TrialMod })
export default class RestrictSubCommand extends MandrocCommand {
  public async exec(message: Message, {
    tag,
    method,
    roles
  }: args) {
    switch (method) {
      case "roles": {
        const changed: { id: string; removed: boolean }[] = [];
        for (let role of roles) {
          const i = tag.allowedRoles.indexOf(role.id);
          if (i !== -1) {
            changed.push({
              id: role.id,
              removed: true
            });

            tag.allowedRoles.splice(i, 1);
          } else {
            changed.push({
              id: role.id,
              removed: false
            });

            tag.allowedRoles.push(role.id);
          }
        }

        const adj = (c: Dictionary) => (c.removed ? "removed" : "added"),
          embed = Embed.Primary(changed.map(c => `**<@&${c.id}>**: ${adj(c)}`));

        await message.util?.send(embed);
        break;
      }

      case "staff": {
        const sen = (tag.staffOnly = !tag.staffOnly)
          ? "now"
          : "no longer";

        const embed = Embed.Primary(`The tag, **${tag.name}**, is ${sen} restricted to staff.`);
        await message.util?.send(embed);

        break;
      }

      case "support": {
        const sen = (tag.supportOnly = !tag.supportOnly)
          ? "now"
          : "no longer";

        const embed = Embed.Primary(`The tag, **${tag.name}**, is ${sen} restricted to support channels.`);
        message.util?.send(embed);
        break
      }
    }

    /* update row */
    await Database.PRISMA.tag.update({
      where: { id: tag.id },
      data: tag
    });
  }

  public * args() {
    const tag = yield {
      type: "tag",
      prompt: {
        start: "Please provide a tag to restrict."
      }
    };

    const method = yield {
      type: [ "staff", "support", "roles" ]
    };

    let roles;
    if (method === "roles") {
      roles = yield {
        type: "role",
        match: "separate",
        prompt: {
          start: "Please provide some roles to restrict the tag to."
        }
      };
    }

    return roles ? {
      tag,
      method,
      roles
    } : {
      tag,
      method
    };
  }
}

type args = {
  tag: Tag;
  method: "staff" | "support" | "roles";
  roles: Role[];
};
