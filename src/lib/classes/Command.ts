import {
  ArgumentMatch,
  ArgumentOptions,
  ArgumentRunnerState,
  Command,
  CommandOptions,
  ContentParserResult,
  Flag,
} from "discord-akairo";

import type { Message } from "discord.js";
import type { Moderation } from "../administrative/Moderation";

export enum PermissionLevel {
  MEMBER,
  DONATOR,
  HELPER,
  TRIAL_MOD,
  MOD,
  ADMIN,
  LOWER_MANAGEMENT,
  MANAGEMENT,
}

export class MandrocCommand extends Command {
  /**
   * The permission level that members need to use this command.
   * @type {PermissionLevel}
   */
  public permissionLevel: PermissionLevel;

  /**
   * @param {string} id The ID of this command.
   * @param {MandrocCommandOptions} options The options for this command.
   */
  public constructor(id: string, options: MandrocCommandOptions = {}) {
    // @ts-expect-error
    super(id, options);

    this.description = this.description || null;
    this.permissionLevel = options.permissionLevel ?? PermissionLevel.MEMBER;
  }

  /**
   * The moderation helper.
   */
  get moderation(): Moderation {
    return this.client.moderation;
  }
}

// @ts-expect-error
export interface MandrocCommandOptions extends CommandOptions {
  permissionLevel?: PermissionLevel;
  args?: MandrocArgumentOptions[] | ArgumentGenerator;
}

export type ArgumentGenerator = (
  message: Message,
  parsed: ContentParserResult,
  state: ArgumentRunnerState
) => IterableIterator<MandrocCommandOptions | Flag>;

// @ts-expect-error
export interface MandrocArgumentOptions extends ArgumentOptions {
  match?: "tentative" | ArgumentMatch;
}
