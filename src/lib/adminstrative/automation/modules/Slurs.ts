/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { Module } from "../Module";

import type { Message } from "discord.js";

const a = "(a|@)";
const e = "(e|3)";
const i = "(1|i)";
const iy = "(1|i|y)";
const o = "(o|0|q)";

export class Slurs extends Module {
  public readonly priority = 1;

  /**
   * Slurs to find.
   * @private
   */
  private get slurs(): string[] {
    return [
      `n+${i}+(g{2,})(${a}|${e}*r+)`,
      `f+${a}g+(${o}+t*)?`,
      `d+${iy}+k+e+`,
      `c+${o}{2,}n+`,
    ];
  }

  public async run(message: Message) {
    const slurs = new RegExp(`(${this.slurs.join("|")})`, "gim");
    const content = message.content.split(" ").join("");

    if (content.match(slurs)) {
      await this.moderation.ban({
        reason: "Offensive Slurs",
        moderator: message.guild?.me!,
        offender: message.member!,
      });

      return message.member?.permissionLevel! < 5;
    }

    return false;
  }
}
