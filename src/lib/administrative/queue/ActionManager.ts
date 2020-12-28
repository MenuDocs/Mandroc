/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { IDs, Moderation, Redis } from "@lib";
import { Collection } from "discord.js";
import { PendingAction } from "./PendingAction";

import type { Mandroc } from "@lib";
import type {
  GuildMember,
  MessageReaction,
  PartialUser,
  TextChannel,
  User,
} from "discord.js";

export class ActionManager {
  /**
   * The client instance.
   */
  readonly moderation: Moderation;

  /**2
   * The current pending actions.
   */
  readonly pending: Collection<string, PendingAction>;

  /**
   * @param moderation The moderation helper.
   */
  constructor(moderation: Moderation) {
    this.moderation = moderation;
    this.client.addListener(
      "messageReactionAdd",
      this._handleReaction.bind(this)
    );
    this.pending = new Collection();
  }

  /**
   * The client instance.
   */
  get client(): Mandroc {
    return this.moderation.client;
  }

  /**
   * The redis shit.
   */
  get redis(): Redis {
    return Redis.get();
  }

  /**
   * The action queue channel.
   */
  async getChannel(): Promise<TextChannel> {
    try {
      return (await this.client.channels.fetch(
        IDs.ACTION_QUEUE,
        true
      )) as TextChannel;
    } catch (e) {
      this.client.log.error("Couldn't find the action queue channel.");
      process.exit(1);
    }
  }

  /**
   * Queue a moderation action.
   */
  async queue(data: ActionData): Promise<void> {
    // Send the message and prepare it.
    const channel = await this.getChannel();
    const message = await channel.send(PendingAction.getEmbed(data));

    await PendingAction.addReactions(message);

    // Create the pending action.
    const raw = {
      ...data,
      timestamp: Date.now(),
      messageId: message.id,
    };

    this.pending.set(message.id, new PendingAction(this, raw));

    // Add to Redis.
    const { client: redis } = this.redis;
    await redis.hset(
      `actions.${message.id}`,
      Redis.prepareObj({
        ...raw,
        subject: raw.subject.id,
      })
    );
  }

  /**
   * Handles an incoming reaction.
   * @param reaction
   * @param user
   */
  async _handleReaction(reaction: MessageReaction, user: User | PartialUser) {
    // handle partial users.
    if (user.partial) {
      user = await user.fetch();
    }

    // handle partial reactions.
    if (reaction.partial) {
      reaction = await reaction.fetch();
    }

    // filter.
    if (user.bot || reaction.message.channel.id !== IDs.ACTION_QUEUE) {
      return;
    }

    await this._sync();
    if (!this.pending.has(reaction.message.id)) {
      return;
    }

    await this.pending.get(reaction.message.id)?.handleReaction(reaction, user);
  }

  private async _sync() {
    const { client: redis, scan } = Redis.get();

    // Sync all pending actions.
    const keys = await scan("actions.*");
    for (const key of keys) {
      const raw: RawPendingAction = (await redis.hgetall(key)) as any;
      if (!this.pending.has(raw.messageId)) {
        this.pending.set(raw.messageId, await PendingAction.fromRaw(this, raw));
      }
    }
  }
}

export interface RawPendingAction {
  messageId: string;
  subject: string;
  description: string;
  timestamp: string;
  reason: string;
}

export interface ActionData {
  subject: GuildMember;
  description: string;
  timestamp?: number;
  reason: string;
}
