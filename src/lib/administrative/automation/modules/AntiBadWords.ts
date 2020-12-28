/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { Module } from "../Module";

import type { Message } from "discord.js";
import { buildString, code, Redis } from "@lib";

const a = "(a|@)";
const e = "(e|3)";
const i = "(1|i|l)";
const iy = "(1|i|y)";
const o = "(o|0|q)";

export class AntiBadWords extends Module {
  readonly priority = 1;

  /**
   * Words to match.
   * @returns {(string | RegExp)[]}
   * @private
   */
  private static async getBlacklistedWordsRegex(): Promise<RegExp | null> {
    const blacklisted = await Redis.get().client.lrange(
      "config.blacklisted-words",
      0,
      -1
    );

    return blacklisted.length > 0
      ? new RegExp(`(${blacklisted.join("|")})`, "gim")
      : null;
  }

  /**
   * AntiBadWords to find.
   * @private
   */
  private static get slurs(): string[] {
    return [
      `n+${i}+(g{2,})(${a}|${e}*r+)`,
      `f+${a}g+(${o}+t*)?`,
      `d+${iy}+k+${e}+`,
      `c+${o}{2,}n+`,
      `r+${e}t+${a}+r+d+`,
    ];
  }

  async run(message: Message): Promise<boolean> {
    return (
      (await this._runSlurs(message)) ||
      (await this._runBlacklistedWords(message))
    );
  }

  /**
   * Checks if the provided message has any slurs.
   * @param {Message} message
   * @returns {Promise<boolean>}
   */
  private async _runSlurs(message: Message): Promise<boolean> {
    const slurs = new RegExp(`(${AntiBadWords.slurs.join("|")})`, "gim"),
      content = message.content.split(" ").join("");

    if (content.match(slurs)) {
      await this.moderation.ban({
        reason: "Offensive AntiBadWords",
        moderator: "automod",
        offender: message.member!,
      });

      return true;
    }

    return false;
  }

  /**
   * Checks if the provided message has any of the blacklisted words inside of it.
   * @param {Message} message
   * @returns {Promise<void>}
   */
  private async _runBlacklistedWords(message: Message): Promise<boolean> {
    const regex = await AntiBadWords.getBlacklistedWordsRegex(),
      content = message.content.split(/[-\s]+/g).join("");

    if (regex && content.match(regex)) {
      await this.moderation.actions.queue({
        subject: message.member!,
        description: buildString((b) =>
          b
            .appendLine(
              `Message by **${message.author.tag}** \`(${message.author.id})\` contained a blacklisted word.`
            )
            .appendLine(code`${message.content}`)
        ),
        reason: "Sent a message containing a blacklisted word.",
      });

      return true;
    }

    return false;
  }
}
