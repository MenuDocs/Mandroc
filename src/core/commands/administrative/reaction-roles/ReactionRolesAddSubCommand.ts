import { adminCommand, Embed, MandrocCommand, ReactionRole } from "@lib";

import type { Emoji, Message, Role, TextChannel } from "discord.js";

export const emojiRegex = /(?:<:\w+:(\d+)>)|(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g;

@adminCommand("rr-add", {
  description: {
    content: "Adds a reaction role to the provided message.",
    usage: "<channel> <message> <emoji> <role>",
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
      match: "content",
      type: async (message, content) => content
        ? message.guild?.emojis.cache.get(content) ?? emojiRegex.exec(content)?.[1]
        : null,
      prompt: {
        start: "You must provide a valid emoji, whether it's custom or not.",
        retry: "Provide a valid emoji.",
      },
    },
    {
      id: "role",
      type: "role",
      prompt: {
        start: "You must provide a valid role.",
        retry: "Provide a valid role.",
      },
    },
    {
      id: "instantRemove",
      match: "flag",
      flag: [ "-ir", "--instant-remove" ],
    },
  ],
})
export class ReactionRolesAddSubCommand extends MandrocCommand {
  async exec(
    message: Message,
    {
      channel,
      messageId,
      emoji,
      role,
      instantRemove,
    }: args,
  ) {
    const e = typeof emoji === "string" ? emoji : emoji.identifier;

    let msg;
    try {
      msg = await channel.messages.fetch(messageId, true);
    } catch (e) {
      const embed = Embed.Danger(
        `The provided message was not found in **${channel}**`,
      );
      return message.util?.send(embed);
    }

    const exists = await ReactionRole.findOne({
      where: {
        messageId,
        emoji: e,
      },
    });

    if (exists) {
      const embed = Embed.Danger(
        `A reaction role for the emoji **${emoji}** already exists.`,
      );
      return message.util?.send(embed);
    }

    await ReactionRole.create({
      messageId,
      emoji: e,
      removeReaction: instantRemove,
      roleId: role.id,
    }).save();

    await msg.react(e);
    const embed = Embed.Primary(
      `Created a reaction role for ${role} with the emoji ${emoji} in ${channel}.`,
    );
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
