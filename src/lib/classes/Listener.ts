import { Module, ModuleOptions } from "./Module";

import type { Mandroc } from "../Client";
import type { Class } from "type-fest";

export class Listener extends Module {
  /**
   * The event to listen for.
   */
  public event: string;

  /**
   * The emitter to attach to.
   */
  public emitter: string;

  /**
   * Whether to use EventEmitter#once when attaching this listener.
   */
  public once: boolean;

  /**
   * Creates a new instanceof Listener.
   * @param client The client instance.
   * @param options The listener options.
   */
  public constructor(client: Mandroc, options: ListenerOptions) {
    super(client, options);

    this.event = options.event;
    this.emitter = options.emitter ?? "client";
    this.once = options.once ?? false;
  }

  /**
   * Called when the configured emitter emits the configured event.
   * @param args The arguments passed.
   */
  public run(...args: unknown[]): unknown {
    void args;
    return;
  }
}

export function listener(options: ListenerOptions) {
  return <T extends Class<Listener>>(target: T) => {
    return class extends target {
      constructor(...args: any[]) {
        super(...args, options);
      }
    }
  }
}

export interface ListenerOptions extends ModuleOptions {
  event: string;
  emitter?: string;
  once?: boolean;
}
