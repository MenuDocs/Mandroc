/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import "./lib/util/Prototypes";
import "./util/Formatter";
import "./extensions/GuildMember";
import "./extensions/Message";
import "./extensions/User";

import type { Logger } from "@ayanaware/logger";

import type { CommandHandler } from "discord-akairo";
import type TurndownService from "turndown";
import type { Moderation } from "./adminstrative/Moderation";
import type { Database } from "./database/Database";
import type { PermissionLevel } from "./classes/Command";
import type { Class } from "type-fest";

export * from "./classes/Command";
export * from "./classes/decorators";

export * from "./database/entities/profile.entity";
export * from "./database/entities/infraction.entity";
export * from "./database/entities/tag.entity";

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
  }

  type ReactionCollectorFilter = (
    reaction: MessageReaction,
    user: User
  ) => boolean;

  interface GuildMember {
    permissionLevel: PermissionLevel | null;
  }

  interface DeletedMessage {
    content: string;
    attachments: string[];
    author: string;
  }

  interface TextBasedChannelFields {
    lastDeletedMessages?: DeletedMessage[];
  }

  interface Message {
    createReactionCollector(
      filter: ReactionCollectorFilter,
      options?: ReactionCollectorOptions
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
}
