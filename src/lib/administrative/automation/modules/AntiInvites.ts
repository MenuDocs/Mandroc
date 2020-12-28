/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { Redis } from "@lib";
import fetch from "node-fetch";
import { Module } from "../Module";

import type { Message } from "discord.js";
import { captureException } from "@sentry/node";

export class AntiInvites extends Module {
  static WHITELISTED = [
    "416512197590777857", // MenuDocs
    "653436871858454538", // (Partner) Solarium
    "261113932146540545", // (Partner) Oxide Support
    "480231440932667393", // (Partner) Nerd Cave Development
    "125227483518861312", // (Development) JDA
    "222078108977594368", // (Development) Discord.js Support
    "336642139381301249", // (Development) Discord.py Support
    "613425648685547541", // (Discord) Developers
    "81384788765712384", // (Discord) API
    "197038439483310086", // (Discord) Testers
    "169256939211980800", // (Discord) Town-hall
  ];

  /**
   * The priority of this automation module
   */
  readonly priority = 2;

  /**
   * The invite regex.
   * @protected
   */
  static get INVITE_REGEXP(): RegExp {
    return /^(?:https?:\/\/)?(?:www\.)?(?:discord\.(?:gg|li|me|io)|(?:discordapp|discord)\.com\/invite)\/(.+)$/g;
  }

  static get URL_REGEXP(): RegExp {
    return /https?:\/\/[^\s$.?#].[^\s]*/gm;
  }

  /**
   * Checks for invites.
   */
  async run(message: Message): Promise<boolean> {
    const content = message.content.split(/-\s_/g).join("");

    let code = AntiInvites.INVITE_REGEXP.test(content)
      ? AntiInvites.INVITE_REGEXP.exec(content)![1]
      : await AntiInvites._checkForUrl(message.content);

    return code ? this._handle(message, code) : false;
  }

  /**
   * Checks whether an invite code exists and whether it's whitelisted or not.
   * @param message The received message.
   * @param code The invite code.
   * @private
   */
  private async _handle(message: Message, code: string): Promise<boolean> {
    let guild: string | null = await Redis.get().client.get(`invites.${code}`);
    if (!guild) {
      try {
        guild = (await this.client.fetchInvite(code)).guild?.id ?? null;
        if (guild) {
          await Redis.get().client.set(`invites.${code}`, guild);
        }
      } catch (e) {
        if (e.code !== 10006) {
          this.client.log.error(e);
        }

        return false;
      }
    }

    if (!guild || AntiInvites.WHITELISTED.includes(guild)) {
      if (!guild) {
        await message.react(":x:");
      }

      return false;
    }

    await this.moderation.ban({
      offender: message.member!,
      duration: "7d",
      reason: "Sent a non-whitelisted invite.",
      moderator: "automod",
    });

    return true;
  }

  /**
   * Checks for an Invite URL within a message.
   * @param content The message content.
   * @private
   */
  private static async _checkForUrl(content: string): Promise<string | null> {
    if (AntiInvites.URL_REGEXP.test(content)) {
      try {
        const [url] = AntiInvites.URL_REGEXP.exec(content)!,
          res = await fetch(url, { redirect: "manual" }),
          loc = res.headers.get("Location");

        if (loc && AntiInvites.INVITE_REGEXP.test(loc)) {
          return AntiInvites.INVITE_REGEXP.exec(loc)![1];
        }
      } catch (e) {
        captureException(e);
      }
    }

    return null;
  }
}
