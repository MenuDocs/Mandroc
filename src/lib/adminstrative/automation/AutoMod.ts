import { Collection, GuildMember } from "discord.js";
import { InfractionType } from "../../database/entities/infraction.entity";

import type { Profile } from "../../database/entities/profile.entity";
import type { Module } from "./Module";
import type { Moderation } from "../Moderation";
import { ModLog } from "../../util/ModLog";

export class AutoMod {
  public readonly moderation: Moderation;

  /**
   * The modules used to moderate messages.
   */
  public readonly modules: Collection<string, Module>;

  /**
   * @param moderation The moderation instance.
   */
  public constructor(moderation: Moderation) {
    this.moderation = moderation;
    this.modules = new Collection();
  }

  /**
   * Checks a profile for the warn thresholds.
   * @param profile The profile to check.
   * @param target The guild member of the profile.
   */
  public runProfile(profile: Profile, target: GuildMember): ModLog | null {
    const infractions = profile.infractions + 1;
    if (infractions >= 3) {
      const modLog = new ModLog(this.moderation.client)
        .setOffender(target)
        .setModerator("automod")
        .setReason(`(AutoMod) Reached ${infractions} Infractions.`);

      if (infractions >= 5) {
        modLog.type = InfractionType.Ban;

        if (infractions === 5) {
          modLog.setDuration("1w");
        }
      } else if (infractions <= 4) {
        modLog.type = InfractionType.Mute;
        modLog.setDuration(infractions === 4 ? "1w" : "30m");
      }

      return modLog;
    }

    return null;
  }
}
