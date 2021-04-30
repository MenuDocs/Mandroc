import { command, config, Database, Embed, MandrocCommand, PermissionLevel } from "@lib";
import { render } from "mustache";

import type { Message, TextChannel } from "discord.js";

@command("tag-show", {
  args: [
    {
      id: "name",
      match: "content",
      type: "lowercase"
    }
  ],
  channel: "guild"
})
export default class ShowSubCommand extends MandrocCommand {
  public async exec(message: Message, { name }: args) {
    if (!name) {
      return;
    }

    const tag = await Database.PRISMA.tag.findFirst({
      where: {
        name,
        OR: {
          name: { contains: name },
          aliases: { has: name }
        }
      }
    });

    if (!tag) {
      return;
    }

    /* check for disallowed roles. */
    if (tag.allowedRoles.length && !tag.allowedRoles.some(r => message.member!.roles.cache.has(r))) {
      return;
    }

    /* check for staff only */
    if (tag.staffOnly && message.member!.permissionLevel! < PermissionLevel.Mod) {
      return;
    }

    /* check for support only */
    if (tag.supportOnly && message.member!.permissionLevel! < PermissionLevel.Helper) {
      const supportChannels = config.get<string>("ids.channels.support").split(",");
      if (!supportChannels.includes((message.channel as TextChannel).parentID!)) {
        return;
      }
    }

    const view = {
      author: {
        id: message.author.id,
        name: message.author.username,
        discrim: message.author.discriminator,
        avatar: message.author.avatarURL(),
        tag: message.author.tag,
        nickname: message.member?.nickname
      },

      guild: {
        memberCount: message.guild!.members.cache.size
      }
    };

    const contents = render(tag.contents, view);
    message.util?.send(tag.embedded ? Embed.Primary(contents) : contents);

    /* update row */
    await Database.PRISMA.tag.update({
      where: { id: tag.id },
      data: {
        uses: { increment: 1 }
      }
    });
  }
}

type args = {
  name: string;
};
