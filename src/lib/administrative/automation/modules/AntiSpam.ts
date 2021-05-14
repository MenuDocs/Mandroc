import { Database, PermissionLevel } from "@lib";
import { Collection, Message } from "discord.js";
import { Module } from "../Module";
import ms from "ms";
import { InfractionType } from "@prisma/client";

export class AntiSpam extends Module {
  buckets = new Collection<string, number[]>();

  /**
   * Attempts to retrieve the last unmute of the provided user.
   *
   * @param user The user id.
   *
   * @returns The timestamp of their last unmute, or null if they haven't gotten umuted before.
   */
  private static async getLastUnmute(user: string): Promise<Date | null> {
    const infraction = await Database.PRISMA.infraction.findFirst({
      where: {
        offenderId: user,
        type: InfractionType.UnMute
      },
      orderBy: {
        id: "desc"
      }
    });

    return infraction?.createdAt ?? null;
  }

  async run(message: Message): Promise<boolean> {
    const pl = message.member!.permissionLevel;
    if (pl && pl >= PermissionLevel.Mod) {
      return false;
    }

    const bucket = this.getBucket(message.author.id);
    bucket.push(message.createdTimestamp);
    const first = bucket.shift()!;

    const lastUnmute = (await AntiSpam.getLastUnmute(message.author.id))?.getTime();
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
          reason: `(Excessive) Spamming in ${message.channel}`
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
            reason: `Spamming in ${message.channel}`
          });

          return true;
        }
      }

      if (message.createdTimestamp - first <= 3000) {
        this.clearBucket(message.author.id);
        await this.moderation.warn({
          offender: message.member!,
          moderator: "automod",
          reason: `Spamming in ${message.channel}`
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
   * Retrieves a user's spam bucket.
   *
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
