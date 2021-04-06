import {
  MandrocCommand,
  MandrocCommandOptions,
  PermissionLevel,
} from "./Command";

import type { Class } from "type-fest";
import type { Listener, ListenerOptions } from "discord-akairo";
import type { Monitor, MonitorOptions } from "./monitor/Monitor";

/**
 * A helper function for commands.
 * @param id
 * @param options
 */
export function listener(id: string, options: ListenerOptions) {
  return <T extends Class<Listener>>(target: T) => {
    return class extends target {
      constructor(...args: any[]) {
        void args;
        super(id, options);
      }
    };
  };
}

/**
 * A helper function for monitors.
 * @param id
 * @param options
 */
export function monitor(id: string, options?: MonitorOptions) {
  return <T extends Class<Monitor>>(target: T) => {
    return class extends target {
      constructor(...args: any[]) {
        super(...args, id, options);
      }
    };
  };
}

/**
 * A helper function for commands.
 * @param id
 * @param options
 */
export function command(id: string, options?: MandrocCommandOptions) {
  return <T extends Class<MandrocCommand>>(target: T) => {
    return class extends target {
      constructor(...args: any[]) {
        void args;
        super(id, options);
      }
    };
  };
}

export function adminCommand(id: string, options: MandrocCommandOptions = {}) {
  return command(id, {
    permissionLevel: PermissionLevel.TRIAL_MOD,
    channel: "guild",
    ...options,
  });
}
