import { adminCommand, Database, Embed, MandrocCommand } from "@lib";

import type { Message, User } from "discord.js";

@adminCommand("block", {
  editable: false,
  permissionLevel: 6,
  args: [
    {
      id: "target",
      type: "user",
      prompt: {
        start: "Please provide a user to block.",
        retry: "I need a user to block."
      }
    }
  ]
})
export default class BlockCommand extends MandrocCommand {
  async exec(message: Message, { target }: args) {
    const targetProfile = await Database.PRISMA.profile.upsert({
      where: { id: target.id },
      create: { id: target.id },
      update: {},
      select: { blocked: true }
    });

    if (targetProfile.blocked) {
      const embed = Embed.Warning("This user is already blocked.");
      return message.util?.send(embed);
    }

    await Database.PRISMA.profile.update({
      where: { id: target.id },
      data: {
        blocked: true
      }
    });

    message.util?.send(Embed.Primary(`**${target.tag}** has been blocked.`));
  }
}

type args = {
  target: User;
};
