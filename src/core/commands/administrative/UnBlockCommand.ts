import { adminCommand, Embed, MandrocCommand, useProfile } from "@lib";

import type { Message, User } from "discord.js";

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
    const [ profile, updateProfile ] = await useProfile(target.id);
    if (!profile.blocked) {
      const embed = Embed.warning("This user isn't blocked.")
      return message.util?.send(embed);
    }

    await updateProfile({
      blocked: false
    });

    const embed = Embed.success(`**${target.tag}** was unblocked.`)
    return message.util?.send(embed);
  }
}

type args = {
  target: User;
};
