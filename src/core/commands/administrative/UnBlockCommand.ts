import { adminCommand, MandrocCommand, Profile } from "@lib";

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
    const targetProfile = await Profile.findOneOrCreate({
      where: { userId: target.id },
      create: { userId: target.id }
    });

    if (targetProfile.blocked)
      return message.channel.send("This user isn't  blocked.");

    targetProfile.blocked = false;

    message.channel.send(`**${target.tag}** was unblocked!`);
  }
}

type args = {
  target: User;
};
