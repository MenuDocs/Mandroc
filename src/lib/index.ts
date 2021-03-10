/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import "@sentry/tracing";
import "reflect-metadata";
import "./util/Formatter";
import "./util/extensions";

import type { Logger } from "@ayanaware/logger";
import type { CommandHandler } from "discord-akairo";
import type TurndownService from "turndown";
import type { Class } from "type-fest";

import type { Moderation } from "./administrative/Moderation";
import type { Database } from "./database/Database";
import type { PermissionLevel } from "./classes/Command";
import type { Redis } from "./database/Redis";
import type { Profile } from "./database/entities/profile.entity";

export * from "./administrative/Moderation";
export * from "./administrative/ModLog";

export * from "./classes/resolver/Resolver";
export * from "./classes/monitor/Monitor";
export * from "./classes/Command";
export * from "./classes/decorators";
export * from "./classes/GiveawayHelper";

export * from "./scheduler/tasks/ScheduledTask";
export * from "./scheduler/Scheduler";

export * from "./database/entities/profile.entity";
export * from "./database/entities/infraction.entity";
export * from "./database/entities/tag.entity";
export * from "./database/entities/reaction-role.entity";
export * from "./database/Redis";

export * from "./util/String";
export * from "./util/Config";
export * from "./util/constants";
export * from "./util/DotNotation";
export * from "./util/Functions";
export * from "./util/Embed";
export * from "./util/MDN";

export * from "./Client";

declare module "discord.js" {
  interface Client {
    log: Logger;
    canMDN: boolean;
    turndown: TurndownService;
    moderation: Moderation;
    database: Database;
    commandHandler: CommandHandler;
    redis: Redis;
  }

  type ReactionCollectorFilter = (
    reaction: MessageReaction,
    user: User,
  ) => boolean;

  interface GuildMember {
    permissionLevel: PermissionLevel | null;

    above(target: GuildMember | PermissionLevel): boolean;

    getProfile(): Promise<Profile>;
  }

  interface DeletedMessage {
    content: string;
    attachments: string[];
    author: string;
  }

  interface TextBasedChannelFields {
    lastDeletedMessages?: DeletedMessage[];
  }

  interface Collection<K, V> {
    /**
     * Returns a collection with a random amount of entries from this Collection.
     *
     * @param amount The number of entries to take.
     */
    randomAmount(amount: number): Collection<K, V>;
  }

  interface Message {
    createReactionCollector(
      filter: ReactionCollectorFilter,
      options?: ReactionCollectorOptions,
    ): ReactionCollector;

    prompt(question: string, embeddable?: boolean): Promise<boolean>;
  }
}

declare module "discord-akairo" {
  interface AkairoHandler {
    findExport(module: Dictionary): Class<AkairoModule> | null;
  }
}

declare global {
  type Dictionary<V = any> = Record<string, V>;

  interface String {
    /**
     * Capitalizes the first letter of the string and makes the rest lower case.
     * @param lowerRest
     */
    capitalize(lowerRest?: boolean): string;
  }

  interface NumberConstructor {
    /**
     * Generates a number between the two given numbers.
     * @param min The lowest the number can be.
     * @param max The highest the number can be.
     */
    random(min: number, max: number): number;
  }

  interface Array<T> {
    /**
     * Shuffles this array.
     */
    shuffle(): Array<T>;

    /**
     * Returns random entry of array.
     */
    random(): T;
  }
}
