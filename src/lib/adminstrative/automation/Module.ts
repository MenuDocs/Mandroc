import type { Moderation } from "../Moderation";
import type { AutoMod } from "./AutoMod";

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

  public get moderation(): Moderation {
    return this.automod.moderation;
  }

  /**
   * Runs this module.
   */
  public abstract run(...args: unknown[]): Promise<boolean>;
}
