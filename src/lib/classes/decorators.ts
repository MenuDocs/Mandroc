/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import {
  MandrocCommand,
  MandrocCommandOptions,
  PermissionLevel,
} from "./Command";

import type { Class } from "type-fest";
import type { Listener, ListenerOptions } from "discord-akairo";

/**
 * A helper function for commands.
 * @param {string} id
 * @param {MandrocCommand} options
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
 * A helper function for commands.
 * @param {string} id
 * @param {MandrocCommand} options
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
    permissionLevel: PermissionLevel.TrialMod,
    channel: "guild",
    ...options,
  });
}
