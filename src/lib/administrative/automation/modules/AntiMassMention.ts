/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { Module } from "../Module";

import type { Message } from "discord.js"
import type { User } from "discord.js";
import type { AutoMod } from "../AutoMod";
import ms from "ms";
import { AntiRaid } from "./AntiRaid";

export class AntiMassMention extends Module {
  /**
   * Mention cache
   */
  #mentionSpamCache = new Array<User>()

  #massMentionCache = new Array<User>();

  /**
   * The priority of this automation module
   */
  readonly priority = 1;

  constructor(automod: AutoMod) {
    super(automod);
    setInterval(() => {
      this.#massMentionCache = [];
      this.#mentionSpamCache = [];
    }, ms("1m"))
  }

  /**
   * Checks for mass-mentions.
   */
  async run(message: Message) {
    return this._antiSpamMention(message) && this._antiMultipleMentions(message);
  }

  /**
   * Checks if a member spams the chat with mentions
   * @param message
   * @private
   */
  private _antiSpamMention(message: Message): boolean {
    this.#mentionSpamCache.push(message.author);
    if (this.#mentionSpamCache.filter(x => x.id === message.author.id).length > 10) {
      AntiRaid.onGoingRaid = true;
    }
    return false;
  }

  /**
   * Checks if a member sends multiple messages with many mentions in them.
   * @param message
   * @private
   */
  private _antiMultipleMentions(message: Message): boolean {
    if (message.mentions.users.size < 3) return false;
    if (this.#massMentionCache.filter(x => x.id === message.author.id).length > 4) {
      AntiRaid.onGoingRaid = true;
    }
    return false;
  }
}
