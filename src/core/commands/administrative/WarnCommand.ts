import { adminCommand, code, Embed, MandrocCommand } from "@lib";

import type { GuildMember, Message } from "discord.js";

@adminCommand("warn", {
  aliases: [ "warn" ],
  editable: false,
  args: [
    {
      id: "target",
      type: "member",
      prompt: {
        start: "Please provide a user to warn.",
        retry: "I need a user to warn."
      }
    },
    {
      id: "reason",
      match: "rest",
      prompt: {
        start: "Please provide a reason for this infraction.",
        retry: "I need a reason for this infraction."
      }
    }
  ]
})
export default class WarnCommand extends MandrocCommand {
  public async exec(message: Message, { target, reason }: args) {
    if (message.deletable)
      await message.delete();

    if (!target.manageable) {
      const embed = Embed.Error("Sorry, you can't warn this user.");
      return message.util?.send(embed);
    }

    await this.client.moderation.warn({
      moderator: message.author,
      offender: target.user,
      reason: reason
    });

    const embed = Embed.Primary(`Warned **${target}**\n${code`${reason}`}`);
    const memberEmbed = Embed.Primary(`You've been warned in **${message.guild?.name}** for \`${reason}\``);

    await message.util?.send(embed)
      .then((m) => m.delete({ timeout: 6000 }));

    return target.user.send(memberEmbed);
  }
}

type args = {
  target: GuildMember;
  reason: string;
}
2