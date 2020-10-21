import { AutoMod } from "./automation/AutoMod";
import {
  Infraction,
  InfractionType,
} from "../database/entities/infraction.entity";
import { IDS } from "../util/constants";
import { ModLog } from "../util/ModLog";
import { Embed } from "../util/Embed";
import ms from "ms";

import type { Mandroc } from "../Client";
import type { GuildMember, Message, TextChannel, User } from "discord.js";

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
    this.client = client;
    this.automation = new AutoMod(this);
  }

  /**
   * The mod logs channel.
   */
  public logChannel(): Promise<TextChannel> {
    return this.client.channels.fetch(IDS.MOD_LOGS, true, true) as Promise<
      TextChannel
    >;
  }

  /**
   * Warns a user.
   * @param data The punishment data.
   */
  public async warn(data: PunishData): Promise<Infraction> {
    return new ModLog(this.client)
      .setReason(data.reason)
      .setOffender(data.offender)
      .setModerator(data.moderator)
      .setType(InfractionType.Warn)
      .post();
  }

  /**
   * Kicks a user.
   * @param data The punishment data.
   * @param dm
   */
  public async kick(data: PunishData, dm = true): Promise<Infraction> {
    const modLog = new ModLog(this.client)
      .setReason(data.reason)
      .setOffender(data.offender)
      .setModerator(data.moderator)
      .setType(InfractionType.Kick);

    if (dm) {
      const embed = Embed.Danger(
        `You've been kicked from ${data.offender.guild.name}\n\`\`\`\n${modLog.reason}\n\`\`\``
      );
      await data.offender.user.send(embed);
    }
    await data.offender.kick(modLog.reason);

    return modLog.post();
  }

  /**
   * Bans a user.
   * @param data The punishment data.
   * @param dm
   */
  public async ban(data: PunishData, dm = true) {
    const modLog = new ModLog(this.client)
      .setReason(data.reason)
      .setOffender(data.offender)
      .setModerator(data.moderator)
      .setType(InfractionType.Ban);

    if (data.duration) {
      modLog.setDuration(data.duration);
      await this.client.scheduler.new(data.offender.id, {
        endAt: Date.now() + (modLog.duration?.ms as number),
        caseId: await modLog.assignCaseId(),
      });
    }

    if (dm) {
      const duration = modLog.duration
        ? ms(modLog.duration.ms, { long: true })
        : null;

      const embed = Embed.Danger(
        `You've been banned from **${data.offender.guild.name}**${
          duration ? ` for **${duration}**` : " permanently"
        }.\n\`\`\`\n${modLog.reason}\n\`\`\``
      );
      await this.tryDm(data.offender.user, embed);
    }

    await data.offender.ban({
      days: 7,
      reason: modLog.reason,
    });

    return modLog.post();
  }

  protected async tryDm(
    user: User,
    ...args: any[]
  ): Promise<Message | undefined> {
    try {
      // @ts-expect-error
      return user.send(...args);
    } catch (e) {
      void e;
      return;
    }
  }
}

export interface PunishData {
  offender: GuildMember;
  moderator: GuildMember;
  reason: string;
  type?: InfractionType;
  duration?: number | string;
}
