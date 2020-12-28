/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { Embed, Moderation, Redis } from "@lib";

import type { Message, MessageEmbed, MessageReaction, User } from "discord.js";
import type {
  ActionData,
  ActionManager,
  RawPendingAction,
} from "./ActionManager";

enum ActionReaction {
  BAN = "790907634378211349",
  MUTE = "790907634101256252",
  CANCEL = "790907963186872320",
  KICK = "👢",
}

export class PendingAction {
  /**
   * The action manager.
   */
  readonly manager: ActionManager;

  /**
   * The guild member.
   */
  data: ActionData;

  /**
   * The message ID.
   */
  messageId: string;

  /**
   * @param manager The action manager.
   * @param data The action data.
   */
  constructor(
    manager: ActionManager,
    data: ActionData & { messageId: string }
  ) {
    this.manager = manager;
    this.data = data;
    this.messageId = data.messageId;
  }

  static async addReactions(message: Message): Promise<void> {
    await Promise.all(
      [
        ActionReaction.MUTE,
        ActionReaction.CANCEL,
        ActionReaction.BAN,
        ActionReaction.KICK,
      ].map((r) => message.react(r))
    );
  }

  static getEmbed(data: ActionData): MessageEmbed {
    return Embed.Primary(data.description)
      .setAuthor("Action Required", data.subject.user.displayAvatarURL())
      .setColor("#b03333")
      .setTimestamp(data.timestamp);
  }

  /**
   * Creates a PendingAction with Raw data from redis.
   * @param manager The pending action manager.
   * @param raw The raw data from redis.
   */
  static async fromRaw(
    manager: ActionManager,
    raw: RawPendingAction
  ): Promise<PendingAction> {
    const subject = await manager.client.guild.members.fetch(raw.subject);

    return new PendingAction(manager, {
      timestamp: Date.parse(raw.timestamp),
      description: raw.description,
      subject,
      messageId: raw.messageId,
      reason: raw.reason,
    });
  }

  /**
   * The moderation helper.
   */
  get moderation(): Moderation {
    return this.manager.client.moderation;
  }

  /**
   * Handles a reaction.
   * @param reaction The added reaction.
   * @param user The user.
   */
  async handleReaction(reaction: MessageReaction, user: User) {
    let canDispose = true,
      str: string | undefined;

    const id = reaction.emoji.id ?? reaction.emoji.name;
    switch (id) {
      case ActionReaction.CANCEL:
        str = "didn't do anything.";
        canDispose = true;
        break;
      case ActionReaction.KICK:
        str = `took action by **kicking** them.`;
        await this.moderation.kick({
          offender: this.data.subject,
          moderator: user,
          reason: this.data.reason,
        });

        break;
      case ActionReaction.BAN:
        str = `took action by **banning** them.`;
        await this.moderation.ban({
          offender: this.data.subject,
          moderator: user,
          reason: this.data.reason,
        });

        break;
      case ActionReaction.MUTE:
        str = `took action by **muting** them.`;
        await this.moderation.mute({
          offender: this.data.subject,
          moderator: user,
          reason: this.data.reason,
        });

        break;
      default:
        canDispose = false;
        break;
    }

    if (canDispose) {
      await this._dispose(str, user);
    }
  }

  /**
   * Disposes of this pending action.
   * @private
   */
  private async _dispose(str?: string, user?: User) {
    this.manager.pending.delete(this.messageId);

    // Delete the action embed.
    const channel = await this.manager.getChannel(),
      message = await channel.messages.fetch(this.messageId, false),
      embed = PendingAction.getEmbed(this.data)
        .setAuthor(
          "Action Completed",
          this.data.subject.user.displayAvatarURL()
        )
        .setColor("#33b05f");

    if (str && user) {
      embed.addField("\u200E", `${user} ${str}`);
    }

    await message.edit(embed);
    await message.reactions.removeAll();

    // Delete the redis key.
    await Redis.get().client.del(`actions.${this.messageId}`);
  }
}
