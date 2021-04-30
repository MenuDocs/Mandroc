import { adminCommand, Database, Embed, MandrocCommand } from "@lib";

import type { Emoji, Message, TextChannel } from "discord.js";

@adminCommand("rr-remove", {
  description: {
    content:
      "Removes a reaction role or all reaction roles from the provided message.",
    usage: "<channel> <message> <emoji> [role]"
  },
  args: [
    {
      id: "channel",
      type: "textChannel",
      prompt: {
        start:
          "You must provide a valid text channel so the provided message id can be fetched.",
        retry: "Provide a valid text channel."
      }
    },
    {
      id: "messageId",
      type: "string",
      prompt: {
        start: "You must provide a valid message id.",
        retry: "Provide a valid message id"
      }
    },
    {
      id: "emoji",
      type: "emoji"
    }
  ]
})
export class ReactionRolesRemoveSubCommand extends MandrocCommand {
  async exec(message: Message, {
    channel,
    messageId,
    emoji
  }: args) {
    let msg;
    try {
      msg = await channel.messages.fetch(messageId, true);
    } catch (e) {
      const embed = Embed.Danger(`Provided message was not found in **${channel}**`);
      return message.util?.send(embed);
    }

    /* check if no emoji was provided, if so remove all reaction roles for the message */
    if (!emoji) {
      const reactionRoles = await Database.PRISMA.reactionRole.findMany({
        where: { messageId },
        select: {
          emojiId: true,
          id: true
        }
      });

      for (const reactionRole of reactionRoles) {
        await msg.reactions.cache.get(reactionRole.emojiId)?.remove();
        await Database.PRISMA.reactionRole.delete({
          where: {
            id_messageId: {
              id: reactionRole.id,
              messageId
            }
          }
        });
      }

      const embed = Embed.Primary(`Removed **${reactionRoles.length}** reaction roles for message [\`${msg.id}\`](${msg.url})`);
      return message.util?.send(embed);
    }

    /* find the row for the provided emoji */
    const exists = await Database.PRISMA.reactionRole.findFirst({
      where: {
        messageId,
        emojiId: emoji.id!!
      },
      select: { id: true }
    });

    if (!exists) {
      const embed = Embed.Danger(`A reaction role for the emoji **${emoji}** doesn't exist.`);
      return message.util?.send(embed);
    }

    /* remove all reactions */
    await msg.reactions.cache.get(emoji.id ?? emoji.name)?.remove();

    /* delete the reaction role from the database. */
    await Database.PRISMA.reactionRole.delete({
      where: {
        id_messageId: {
          id: exists.id,
          messageId
        }
      }
    });

    const embed = Embed.Primary(`Removed reaction role for emoji ${emoji}`);
    return message.util?.send(embed);
  }
}

type args = {
  channel: TextChannel;
  messageId: string;
  emoji: Emoji;
};
