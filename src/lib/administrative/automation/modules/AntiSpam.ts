/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { IDs, PermissionLevel } from "@lib";
import { Collection, Message, TextChannel } from "discord.js";
import { Module } from "../Module";
import ms from "ms";

export class AntiSpam extends Module {
  buckets = new Collection<string, number[]>();

  async run(message: Message): Promise<boolean> {
    const pl = message.member!.permissionLevel;
    if (pl && pl >= PermissionLevel.MOD) {
      return false;
    }

    const bucket = this.getBucket(message.author.id);
    bucket.push(message.createdTimestamp);
    const first = bucket.shift()!;

    const lastUnmute = this.getLastUnmute(message.author.id);

    if (bucket.length >= 5) {
      if (
        message.editedTimestamp &&
        message.editedTimestamp > message.createdTimestamp
      ) {
        return false;
      }

      if (lastUnmute && message.createdTimestamp - lastUnmute <= ms("1h 15m")) {
        this.clearBucket(message.author.id);
        await this.moderation.ban({
          offender: message.member!,
          moderator: "automod",
          duration: "7d",
          reason: `(Excessive) Spamming in ${message.channel}`,
        });

        return true;
      }

      if (bucket.length > 8) {
        if (message.createdTimestamp - first <= 3000) {
          this.clearBucket(message.author.id);
          await this.moderation.mute({
            offender: message.member!,
            moderator: "automod",
            duration: "1h",
            reason: `Spamming in ${message.channel}`,
          });

          return true;
        }
      }

        if (message.createdTimestamp - first <= 3000) {
          this.clearBucket(message.author.id);
          await this.moderation.warn({
            offender: message.member!,
            moderator: "automod",
            reason: `Spamming in ${message.channel}`,
          });

          return true;
      }
    }

    this.cleanUp();
    return false;
  }

  private cleanUp(): void {
    const now = Date.now();
    for (const [k, v] of this.buckets) {
      if (now - v[v.length - 1] >= 5000) {
        this.buckets.delete(k);
      }
    }
  }

  /**
   *
   * @param user The user id.
   */
  private getLastUnmute(user: string): number | null {
    const modlogs = <TextChannel>this.client.channels.cache.get(IDs.MOD_LOGS);
    return [...modlogs.messages.cache.values()].slice(0, 5).filter(msg => {
      const msgEmbed = msg.embeds[0];
      return msgEmbed
        && msgEmbed.description?.includes(user)
        && msgEmbed.author?.name?.includes("unmute")
    })[0].createdTimestamp ?? null
  }

  /**
   * @param user The user id.
   */
  private getBucket(user: string): number[] {
    if (!this.buckets.has(user)) {
      this.buckets.set(user, []);
    }

    return this.buckets.get(user)!;
  }

  /**
   * @param user The user ID
   */
  private clearBucket(user: string): void {
    this.buckets.delete(user);
  }
}
