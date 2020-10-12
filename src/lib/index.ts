import "./extensions/GuildMember";
import "./extensions/Message";
import "./extensions/User";

import type { Signale } from "signale";
import type TurndownService from "turndown";
import type { Moderation } from "./adminstrative/Moderation";
import type { Database } from "./database/Database";
import type { PermissionLevel } from "./classes/Command";

export * from "./classes/Command";
export * from "./classes/decorators";

export * from "./database/entities/profile.entity";
export * from "./database/entities/infraction.entity";

export * from "./util/Config";
export * from "./util/constants";
export * from "./util/DotNotation";
export * from "./util/Functions";
export * from "./util/Embed";
export * from "./util/MDN";

export * from "./Client";

declare module "discord.js" {
  interface Client {
    log: Signale;
    canMDN: boolean;
    turndown: TurndownService;
    moderation: Moderation;
    database: Database;
  }

  type ReactionCollectorFilter = (
    reaction: MessageReaction,
    user: User
  ) => boolean;

  interface GuildMember {
    permissionLevel: PermissionLevel | null;
  }

  interface Message {
    createReactionCollector(
      filter: ReactionCollectorFilter,
      options?: ReactionCollectorOptions
    ): ReactionCollector;

    prompt(question: string, embeddable?: boolean): Promise<boolean>;
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
