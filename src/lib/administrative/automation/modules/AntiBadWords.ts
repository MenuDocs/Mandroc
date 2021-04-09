import { Module } from "../Module";
import { code } from "../../../util";
import { Redis } from "../../../database";

import type { Message } from "discord.js";

const a =  "[a@]";
const e =  "[e3]";
const i =  "[1il!]";
const iy = "[1iy!]";
const o =  "[o0q]";

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
      -1,
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
      `n+${i}+g+(${a}((r|h)+)?|${e}*r+)`,
      `f+${a}g+(${o}+t*)?`,
      `d+${iy}+k+${e}+`,
      `c+${o}{2,}n+`,
      `r+${e}t+${a}+r+d+`,
      `b+${e}+${a}+n+${e}+r+`,
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
      const desc = [
        `Message by **${message.author.tag}** \`(${message.author.id})\` contained a blacklisted word.`,
        code`${message.content}`,
      ];

      await this.moderation.actions.queue({
        subject: message.member!,
        description: desc.join("\n"),
        reason: "Sent a message containing a blacklisted word.",
      });

      return true;
    }

    return false;
  }
}
