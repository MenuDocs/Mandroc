import { AkairoModule, AkairoModuleOptions, Flag } from "discord-akairo";

import type { Message } from "discord.js";

export abstract class Resolver<T> extends AkairoModule {
  /**
   * The name of this resolver.
   */
  readonly name: string;

  /**
   * @param id The ID of this resolver.
   * @param options The resolver options.
   */
  protected constructor(id: string, options: ResolverOptions) {
    super(id, options);

    this.name = options.name;
  }

  /**
   * Called whenever an argument type matches the id of this resolver.
   * @param message The message that was received.
   * @param phrase The phrase to resolve.
   */
  abstract exec(
    message: Message,
    phrase: string | null | undefined
  ): Promise<T | null | Flag> | (T | null | Flag);
}

export interface ResolverOptions extends AkairoModuleOptions {
  /**
   * The name of the resolver.
   */
  name: string;
}
