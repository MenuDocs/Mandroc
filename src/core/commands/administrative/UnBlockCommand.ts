import { adminCommand, Database, MandrocCommand } from "@lib";

import type { Message } from "discord.js";
import type { User } from "discord.js";

@adminCommand("unblock", {
  editable: false,
  permissionLevel: 6,
  args: [
    {
      id: "target",
      type: "user",
      prompt: {
        start: "Please provide a user to unblock.",
        retry: "I need a user to unblock."
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


    if (!targetProfile.blocked)
      return message.util?.send("This user isn't  blocked.");

    targetProfile.blocked = false;

    message.channel.send(`**${target.tag}** was unblocked!`);
  }
}

type args = {
  target: User;
};
