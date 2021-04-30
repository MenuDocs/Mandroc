import { command, Database, Embed, MandrocCommand, Moderation, PermissionLevel } from "@lib";
import { InfractionType, Prisma } from "@prisma/client";

import type { Message } from "discord.js";

@command("unban", {
  aliases: [ "unban" ],
  permissionLevel: PermissionLevel.Admin,
  args: [
    {
      id: "user",
      type: (_, p) => {
        if (/<@!?(\d+)>/.test(p)) {
          const [ , id ] = /<@!?(\d+)>/.exec(p)!;
          return id;
        }

        return p;
      },
      prompt: {
        start: "Please provide someone to unban.",
        retry: "I need someone to unban"
      }
    },
    {
      id: "reason",
      match: "rest",
      prompt: {
        start: "Please provide a reason for unbanning this user.",
        retry: "I need a reason for unbanning this user."
      }
    }
  ]
})
export class UnbanCommand extends MandrocCommand {
  static getOrigin(user: string, type: InfractionType): Prisma.Prisma__InfractionClient<{ id: number; messageId: string | null; } | null> {
    return Database.PRISMA.infraction.findFirst({
      where: {
        type: type,
        offenderId: user
      },
      select: {
        id: true,
        messageId: true
      },
      orderBy: {
        id: "desc"
      }
    });
  }

  async exec(message: Message, {
    user,
    reason
  }: args) {
    let ban;
    try {
      ban = await message.guild?.fetchBan(user);
    } catch {
      const embed = Embed.Primary(`\`${user}\` isn't banned?`);
      return message.util?.send(embed);
    }

    const infraction = await UnbanCommand.getOrigin(user, InfractionType.Ban)
    const origin = infraction
      ? `was **[Case ${infraction.id}](${Moderation.lcUrl}/${infraction.messageId})**`
      : "is unknown";

    await this.client.moderation.unban(
      {
        offender: ban!.user,
        reason: `${reason}${infraction ? ` (#${infraction.id})` : ""}`,
        moderator: message.member!
      },
      message.guild!
    );

    const embed = Embed.Primary(`Unbanned \`${user}\`, their ban origin ${origin}.`);
    return message.util?.send(embed);
  }
}

type args = {
  user: string;
  reason: string;
};
