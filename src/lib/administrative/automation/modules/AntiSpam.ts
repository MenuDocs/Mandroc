/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { PermissionLevel } from "@lib";
import { Collection, Message } from "discord.js";
import { Module } from "../Module";

export class AntiSpam extends Module {
  buckets = new Collection<string, number[]>();

  async run(message: Message): Promise<boolean> {
    const pl = message.member!.permissionLevel;
    if (pl && pl >= PermissionLevel.MOD) {
      return false;
    }

    const bucket = this.getBucket(message.author.id);
    bucket.push(message.createdTimestamp);

    if (bucket.length >= 5) {
      const first = bucket.shift()!;
      if (
        message.editedTimestamp &&
        message.editedTimestamp > message.createdTimestamp
      ) {
        return false;
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
