/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { Command, CommandOptions } from "discord-akairo";

export enum PermissionLevel {
  Member,
  Donator,
  Helper,
  TrialMod,
  Mod,
  Admin,
  LowerManagement,
  Management,
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
    super(id, options);

    this.description = this.description || null;
    this.permissionLevel = options.permissionLevel ?? PermissionLevel.Member;
  }
}

export interface MandrocCommandOptions extends CommandOptions {
  permissionLevel?: PermissionLevel;
}
