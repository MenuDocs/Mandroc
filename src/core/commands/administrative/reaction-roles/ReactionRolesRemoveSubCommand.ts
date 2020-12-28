/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { adminCommand, Embed, MandrocCommand, ReactionRole } from "@lib";

import type { Emoji, Message, TextChannel } from "discord.js";

@adminCommand("rr-remove", {
  description: {
    content:
      "Removes a reaction role or all reaction roles from the provided message.",
    usage: "<channel> <message> <emoji> [role]",
  },
  args: [
    {
      id: "channel",
      type: "textChannel",
      prompt: {
        start:
          "You must provide a valid text channel so the provided message id can be fetched.",
        retry: "Provide a valid text channel.",
      },
    },
    {
      id: "messageId",
      type: "string",
      prompt: {
        start: "You must provide a valid message id.",
        retry: "Provide a valid message id",
      },
    },
    {
      id: "emoji",
      type: "emoji",
    },
  ],
})
export class ReactionRolesRemoveSubCommand extends MandrocCommand {
  async exec(message: Message, { channel, messageId, emoji }: args) {
    let msg;
    try {
      msg = await channel.messages.fetch(messageId, true);
    } catch (e) {
      const embed = Embed.Danger(
        `The provided message was not found in **${channel}**`
      );
      return message.util?.send(embed);
    }

    if (!emoji) {
      const reactionRoles = await ReactionRole.find({ where: { messageId } });
      for (const reactionRole of reactionRoles) {
        await msg.reactions.cache.get(reactionRole.emoji)?.remove();
        await reactionRole.remove();
      }

      const embed = Embed.Primary(
        `Removed **${reactionRoles.length}** reaction roles for message [\`${msg.id}\`](${msg.url})`
      );
      return message.util?.send(embed);
    }

    const exists = await ReactionRole.findOne({
      where: {
        messageId,
        emoji: emoji.id ?? emoji.name,
      },
    });

    if (!exists) {
      const embed = Embed.Danger(
        `A reaction role for the emoji **${emoji}** doesn't exist.`
      );
      return message.util?.send(embed);
    }

    await msg.reactions.cache.get(emoji.id ?? emoji.name)?.remove();
    await exists.remove();

    const embed = Embed.Primary(`Removed reaction role for emoji ${emoji}`);
    return message.util?.send(embed);
  }
}

type args = {
  channel: TextChannel;
  messageId: string;
  emoji: Emoji;
};
