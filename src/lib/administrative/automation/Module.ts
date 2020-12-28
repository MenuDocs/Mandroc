/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import type { Message } from "discord.js";
import type { Moderation } from "../Moderation";
import type { AutoMod } from "./AutoMod";
import type { Mandroc } from "@lib";

export abstract class Module {
  public readonly automod: AutoMod;

  /**
   * The priority of this module.
   */
  public readonly priority: number = 10;

  /**
   * Whether this module is for messages.
   */
  public readonly passive: boolean = true;

  /**
   * @param automod AutoMod instance.
   */
  public constructor(automod: AutoMod) {
    this.automod = automod;
  }

  /**
   * The client instance.
   */
  public get client(): Mandroc {
    return this.moderation.client;
  }

  /**
   * The moderation instance.
   */
  public get moderation(): Moderation {
    return this.automod.moderation;
  }

  /**
   * Runs this module.
   */
  public abstract run(message: Message, ...args: unknown[]): Promise<boolean>;
}
