import { AutoMod } from "./automation/AutoMod";
import { Infraction, InfractionType } from "../database/entities/infraction.entity";
import { IDS } from "../util/constants";
import { ModLog } from "../util/ModLog";

import type { Mandroc } from "../Client";
import type { TextChannel, User } from "discord.js";

export class Moderation {
  /**
   * The AutoMod instance.
   */
  public readonly automation: AutoMod;

  /**
   * The client.
   */
  public readonly client: Mandroc;

  /**
   * @param client The client instance.
   */
  public constructor(client: Mandroc) {
    this.automation = new AutoMod(this);
    this.client = client;
  }

  /**
   * The mod logs channel.
   */
  public logChannel(): Promise<TextChannel> {
    return this.client.channels.fetch(IDS.MOD_LOGS) as Promise<TextChannel>;
  }

  /**
   * Warns a user.
   * @param data
   */
  public async warn(data: PunishData): Promise<Infraction> {
    return new ModLog(this.client)
      .setReason(data.reason)
      .setOffender(data.offender)
      .setModerator(data.moderator)
      .setType(InfractionType.Warn)
      .post();
  }

  public async ban(data: PunishData) {
    const modLog = new ModLog(this.client)
      .setReason(data.reason)
      .setOffender(data.offender)
      .setModerator(data.moderator)
      .setType(InfractionType.Ban);

    if (data.duration) {
      modLog.setDuration(data.duration);
      await this.client.scheduler.new(data.offender.id, {
        endAt: Date.now() + (modLog.duration?.ms as number),
        caseId: await modLog.assignCaseId()
      });
    }

    return modLog.post();
  }
}

export interface PunishData {
  offender: User;
  moderator: User;
  reason: string;
  type?: InfractionType;
  duration?: number | string;
}
