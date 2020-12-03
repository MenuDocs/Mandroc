import { IDS, listener } from "@lib";
import { Listener } from "discord-akairo";

import type { User, PartialUser, MessageReaction } from "discord.js";

@listener("message-reaction-add", { event: "messageReactionAdd", emitter: "client" })
export default class MessageReactionAddListener extends Listener {
  async exec(reaction: MessageReaction, user: User | PartialUser) {
    if (reaction.partial) {
      reaction = await reaction.fetch();
    }

    const { guild } = reaction.message;
    if (!guild) {
      return;
    }

    const member = guild.members.cache.get(user.id);
    if (member?.roles.cache.has(IDS.Unverified)) {
      member?.roles.remove(IDS.Unverified);
    }
  }
}