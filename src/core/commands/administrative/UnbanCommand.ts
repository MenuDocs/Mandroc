import {
  command,
  Embed,
  Infraction,
  InfractionType,
  MandrocCommand,
  Moderation,
  PermissionLevel
} from "@lib";

import type { Message } from "discord.js";

@command("unban", {
  aliases: ["unban"],
  permissionLevel: PermissionLevel.Admin,
  args: [
    {
      id: "user",
      type: (_, p) => {
        if (/<@!?(\d+)>/.test(p)) {
          const [, id] = /<@!?(\d+)>/.exec(p)!;
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
  async exec(message: Message, { user, reason }: args) {
    let ban;
    try {
      ban = await message.guild?.fetchBan(user);
    } catch {
      const embed = Embed.Primary(`\`${user}\` isn't banned?`);
      return message.util?.send(embed);
    }

    const infraction = await Infraction.findOne({
      where: {
        type: InfractionType.BAN,
        offenderId: user
      },
      order: { id: "DESC" }
    });

    const origin = infraction
      ? `was **[Case ${infraction.id}](${Moderation.lcurl}/${infraction.messageId})**`
      : "is unknown";

    await this.client.moderation.unban(
      {
        offender: ban!.user,
        reason: `${reason}${infraction ? ` (#${infraction.id})` : ""}`,
        moderator: message.member!
      },
      message.guild!
    );

    const embed = Embed.Primary(
      `Unbanned \`${user}\`, their ban origin ${origin}.`
    );
    return message.util?.send(embed);
  }
}

type args = {
  user: string;
  reason: string;
};
