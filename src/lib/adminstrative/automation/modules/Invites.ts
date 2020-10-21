import { Collection, Invite, Message } from "discord.js";

import { Module } from "../Module";
import fetch from "node-fetch";

const whitelisted = [
  "416512197590777857", // MenuDocs
  "653436871858454538", // (Partner) Solarium
  "261113932146540545", // (Partner) Oxide Support
  "125227483518861312", // (Development) JDA
  "222078108977594368", // (Development) Discord.js Support
  "336642139381301249", // (Development) Discord.py Support
  "613425648685547541", // (Discord) Developers
  "81384788765712384", // (Discord) API
  "197038439483310086", // (Discord) Testers
];

export class Invites extends Module {
  public readonly priority = 2;

  /**
   * Cached invites.
   * @protected
   */
  protected readonly cached = new Collection<string, Invite>();

  /**
   * The invite regex.
   * @protected
   */
  protected get regex(): RegExp {
    return /^(?:https?:\/\/)?(?:www\.)?(?:discord\.(?:gg|li|me|io)|(?:discordapp|discord)\.com\/invite)\/(.+)$/g;
  }

  protected get urlRegex(): RegExp {
    return /^(https?|chrome):\/\/[^\s$.?#].[^\s]*$/gm;
  }

  /**
   * Checks for invites.
   */
  public async run(message: Message): Promise<boolean> {
    let code;
    if (this.regex.test(message.cleanContent)) {
      code = this.regex.exec(message.cleanContent)![1];
    } else if (this.urlRegex.test(message.cleanContent)) {
      const [url] = this.urlRegex.exec(message.cleanContent) as RegExpExecArray,
        res = await fetch(url, { redirect: "manual" }),
        loc = res.headers.get("Location");

      if (loc && this.regex.test(loc)) {
        code = this.regex.exec(loc)![1];
      }
    }

    return code ? this._handle(message, code) : false;
  }

  protected async _handle(message: Message, code: string): Promise<boolean> {
    let inv: Invite | undefined = this.cached.get(code);
    if (!inv) {
      try {
        inv = await this.client.fetchInvite(code);
        this.cached.set(code, inv);
      } catch (e) {
        if (e.code !== 10006) {
          this.client.log.error(e);
        }

        return false;
      }
    }

    if (inv.guild?.id && whitelisted.includes(inv.guild?.id)) {
      return false;
    }

    await this.moderation.ban({
      offender: message.member!,
      duration: "7d",
      reason: "Sent a non-whitelisted invite.",
      moderator: message.guild?.me!,
    });

    return true;
  }
}
