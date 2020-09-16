import { Base } from "discord.js";

import type { Mandroc } from "../Client";

export abstract class Module extends Base {
  /**
   * The client instance.
   */
  public readonly client!: Mandroc;

  /**
   * Whether this module is disabled.
   */
  public disabled: boolean | Disabled;

  /**
   * Creates a new instanceof Module.
   * @param client The client instance.
   * @param options The module options.
   */
  protected constructor(client: Mandroc, options: ModuleOptions = {}) {
    super(client);

    this.disabled = (typeof options.disabled === "function"
      ? options.disabled.bind(this)
      : options.disabled) ?? true;
  }

}

type Disabled = () => boolean;

export interface ModuleOptions {
  disabled?: boolean | Disabled;
}
