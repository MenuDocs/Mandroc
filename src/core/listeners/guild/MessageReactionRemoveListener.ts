/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { listener, ReactionRole } from "@lib";
import { Listener } from "discord-akairo";

import type { MessageReaction, PartialUser, User } from "discord.js";

@listener("message-reaction-remove", {
  event: "messageReactionRemove",
  emitter: "client",
})
export class MessageReactionRemoveListener extends Listener {
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

    const member = await guild.members.fetch(user.id),
      reactionRole = await ReactionRole.findOne({
        where: {
          messageId: id,
          emoji: reaction.emoji.id ?? reaction.emoji.name,
        },
      });

    if (!reactionRole) {
      return;
    }

    await member.roles.remove(reactionRole.roleId);
  }
}
