/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { AkairoModule, AkairoModuleOptions } from "discord-akairo";

import type { Message, MessageType } from "discord.js";

export class Monitor extends AkairoModule {
  /**
   * Types of messages to ignore.
   */
  ignore: MessageType[];

  /**
   * @param id The ID of this monitor.
   * @param options The options to use
   */
  constructor(id: string, options: MonitorOptions = {}) {
    super(id, options);

    this.ignore = options.ignore ?? [];
  }

  /**
   * Called whenever a message was received.
   * @param message The received message.
   */
  async exec(message: Message) {
    void message;
  }
}

export interface MonitorOptions extends AkairoModuleOptions {
  ignore?: MessageType[];
}
