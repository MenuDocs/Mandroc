/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import moment from "moment";
import type { Moderation, Profile } from "@lib";
import { buildString, Infraction, InfractionType, ModLog } from "@lib";

import { AntiInvites } from "./modules/AntiInvites";
import { AntiBadWords } from "./modules/AntiBadWords";
import { AntiCodeBlock } from "./modules/AntiCodeBlock";
import { AntiMaliciousFiles } from "./modules/AntiMaliciousFiles";
import { AntiSpam } from "./modules/AntiSpam";

import type { GuildMember, Message } from "discord.js";
import type { Module } from "./Module";
import { AntiMassMention } from "./modules/AntiMassMention";
import { AntiMassModeration } from "./modules/AntiMassModeration";

export class AutoMod {
  public readonly moderation: Moderation;

  /**
   * The modules used to moderate messages.
   */
  public readonly modules: Module[];

  /**
   * @param moderation The moderation instance.
   */
  public constructor(moderation: Moderation) {
    this.moderation = moderation;
    this.modules = [
      AntiCodeBlock,
      AntiMaliciousFiles,
      AntiInvites,
      AntiBadWords,
      AntiSpam,
      AntiMassMention,
      AntiMassModeration
    ].map((mod) => new mod(this));

    moderation.client.on("message", this._runModules.bind(this));
    moderation.client.on("messageUpdate", async (old, message) => {
      if (message.partial) {
        message = await message.fetch();
      }

      if (message.author.bot) {
        return;
      }

      if (old.content !== message.content) {
        return this._runModules(message as Message);
      }
    });
  }

  /**
   * Checks a profile for the warn thresholds.
   * @param profile The profile to check.
   * @param target The guild member of the profile.
   * @param increment Whether to increment the users current warn amount.
   */
  public async runProfile(
    target: GuildMember,
    profile?: Profile | null,
    increment = true
  ): Promise<ModLog | null> {
    if (!profile) {
      profile = await target.getProfile();
    }

    let infractions = await profile.getInfractionCount(InfractionType.WARN);
    if (increment) {
      infractions += 1;
    }

    if (infractions >= 2) {
      const modLog = new ModLog(this.moderation.client)
        .setOffender(target)
        .setModerator("automod")
        .setReason(`Reached ${infractions} Infractions.`);

      switch (infractions) {
        case 2:
          modLog.setType(InfractionType.MUTE).setDuration("12h");

          break;
        case 3:
          modLog.setType(InfractionType.MUTE).setDuration("3d");

          break;
        case 5:
          const infractions = await Infraction.find({
            where: {
              offenderId: target.id,
            },
          });

          await this.moderation.actions.queue({
            description: buildString((b) => {
              b.appendLine(
                `User *${target.user.tag}* \`(${target.id})\` has reached **5** infractions.`
              ).appendLine();

              infractions.forEach((infraction, idx) => {
                b.appendLine(
                  `\`${`${idx + 1}`.padStart(2, "0")}\` **${moment(
                    infraction.createdAt
                  ).format("L LT")}** for \`${infraction.reason}\``
                );
              });
            }),

            subject: target,
            reason: "Reached 5 infractions.",
          });

          return null;
      }

      return modLog;
    }

    return null;
  }

  private async _runModules(message: Message) {
    if (message.partial) {
      await message.fetch();
    }

    if (!message.guild) {
      return;
    }

    for (const module of this.modules) {
      const doBreak = await module.run(message);
      if (doBreak) {
        break;
      }
    }
  }
}
