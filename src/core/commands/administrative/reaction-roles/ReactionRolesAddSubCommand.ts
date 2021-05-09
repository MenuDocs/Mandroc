import { adminCommand, Database, Embed, MandrocCommand } from "@lib";

import type { Emoji, Message, Role, TextChannel } from "discord.js";

export const emojiRegex = /<a?:[\w\d-_]+:(\d+)>/g;

@adminCommand("rr-add", {
  description: {
    content: "Adds a reaction role to the provided message.",
    usage: "<channel> <message> <emoji> <role>"
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
      match: "content",
      type: async (message, content) => {
        const matches = emojiRegex.exec(content);
        if (!matches) {
          return null;
        }

        const emoteId = matches[1];
        return message.guild!.emojis.cache.get(emoteId);
      },
      prompt: {
        start: "You must provide a valid emoji, must be a guild emote.",
        retry: "Provide a valid emoji."
      }
    },
    {
      id: "role",
      type: "role",
      prompt: {
        start: "You must provide a valid role.",
        retry: "Provide a valid role."
      }
    },
    {
      id: "instantRemove",
      match: "flag",
      flag: [ "-ir", "--instant-remove" ]
    }
  ]
})
export class ReactionRolesAddSubCommand extends MandrocCommand {
  async exec(
    message: Message,
    {
      channel,
      messageId,
      emoji,
      role,
      instantRemove
    }: args
  ) {
    const e = typeof emoji === "string" ? emoji : emoji.identifier;

    let msg;
    try {
      msg = await channel.messages.fetch(messageId, true);
    } catch (e) {
      const embed = Embed.danger(
        `The provided message was not found in **${channel}**`
      );
      return message.util?.send(embed);
    }

    const exists = await Database.PRISMA.reactionRole.findFirst({
      where: {
        messageId,
        emojiId: e
      },
      select: {}
    });

    if (exists) {
      const embed = Embed.danger(
        `A reaction role for the emoji **${emoji}** already exists.`
      );
      return message.util?.send(embed);
    }

    await Database.PRISMA.reactionRole.create({
      data: {
        messageId,
        emojiId: e,
        removeReaction: instantRemove,
        roleId: role.id
      }
    });

    await msg.react(e);
    const embed = Embed.primary(`Created a reaction role for ${role} with the emoji ${emoji} in ${channel}.`);
    return message.util?.send(embed);
  }
}

type args = {
  channel: TextChannel;
  messageId: string;
  emoji: Emoji | string;
  role: Role;
  instantRemove: boolean;
};
