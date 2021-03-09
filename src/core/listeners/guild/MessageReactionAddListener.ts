import { IDs, listener, ReactionRole } from "@lib";
import { Listener } from "discord-akairo";

import type { MessageReaction, PartialUser, User } from "discord.js";

@listener("message-reaction-add", {
  event: "messageReactionAdd",
  emitter: "client",
})
export default class MessageReactionAddListener extends Listener {
  async exec(reaction: MessageReaction, user: User | PartialUser) {
    if (user.bot) {
      return;
    }

    if (reaction.partial) {
      reaction = await reaction.fetch();
    }

    const { guild, id } = reaction.message;
    if (!guild) {
      return;
    }

    const member = await guild.members.fetch(user.id);
    switch (id) {
      case IDs.VERIFICATION_MESSAGE:
        if (reaction.emoji.name !== "✅") {
          break;
        }

        if (member?.roles.cache.has(IDs.UNVERIFIED)) {
          member?.roles.remove(IDs.UNVERIFIED);
        }

        break;
      default:
        const reactionRole = await ReactionRole.findOne({
          where: {
            messageId: id,
            emoji: reaction.emoji.id ?? reaction.emoji.name,
          },
        });

        if (!reactionRole) {
          break;
        }

        await member.roles.add(reactionRole.roleId);
        if (reactionRole.removeReaction) {
          await reaction.remove();
        }

        break;
    }
  }
}
