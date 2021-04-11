import ms from "ms";
import { Module } from "../Module";
import { AntiRaid } from "./AntiRaid";

import type { Message, User } from "discord.js";
import type { AutoMod } from "../AutoMod";

export class AntiMassMention extends Module {
  /**
   * Mention cache
   */
  #mentionSpamCache = new Array<User>();

  #massMentionCache = new Array<User>();

  constructor(automod: AutoMod) {
    super(automod, 1);

    this.client.setInterval(() => {
      this.#massMentionCache = [];
      this.#mentionSpamCache = [];
    }, ms("1m"));
  }

  /**
   * Checks for mass-mentions.
   */
  async run(message: Message) {
    return (
      this._antiSpamMention(message) && this._antiMultipleMentions(message)
    );
  }

  /**
   * Checks if a member spams the chat with mentions
   * @param message
   * @private
   */
  private _antiSpamMention(message: Message): boolean {
    this.#mentionSpamCache.push(message.author);
    if (
      this.#mentionSpamCache.filter(x => x.id === message.author.id).length > 10
    ) {
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
    if (message.mentions.users.size < 3) {
      return false;
    }
    if (
      this.#massMentionCache.filter(x => x.id === message.author.id).length > 4
    ) {
      AntiRaid.onGoingRaid = true;
    }
    return false;
  }
}
