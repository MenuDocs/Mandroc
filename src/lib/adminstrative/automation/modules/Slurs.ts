import { Module } from "../Module";

import type { Message } from "discord.js";

export class Slurs extends Module {
  public readonly priority = 1;

  public async run(message: Message) {
    const slurs = new RegExp(`${this.slurs.join("|")}`);
    const content = message.content.split(" ").join("");

    if (content.match(slurs)) {
      // this.moderation.ban()
      throw content;
    }

    return true;
  }

  /**
   * Slurs to find.
   * @private
   */
  private get slurs(): string[] {
    return [
      "nigger",
      "nigga",
      "faggot",
      "fag",
      "dike",
      "coon"
    ]
  }
}