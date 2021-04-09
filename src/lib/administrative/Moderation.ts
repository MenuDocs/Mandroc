import { code, Embed, IDs, Infraction, InfractionType, Mandroc, ModLog, Scheduler } from "@lib";
import ms from "ms";
import { captureException } from "@sentry/node";

import { AutoMod } from "./automation/AutoMod";
import { ActionManager } from "./queue/ActionManager";

import type { Guild, GuildMember, Message, TextChannel, User } from "discord.js";

const DEFAULT_DM_VALUE = true;

export class Moderation {
  /**
   * The AutoMod instance.
   */
  readonly automation: AutoMod;

  /**
   * The client.
   */
  readonly client: Mandroc;

  /**
   * The pending action queue.
   */
  readonly actions: ActionManager;

  /**
   * @param client The client instance.
   */
  constructor(client: Mandroc) {
    this.client = client;
    this.automation = new AutoMod(this);
    this.actions = new ActionManager(this);
  }

  static get lcurl(): string {
    return `https://discord.com/channels/${IDs.GUILD}/${IDs.MOD_LOGS}`;
  }

  /**
   * The mod logs channel.
   */
  logChannel(): Promise<TextChannel> {
    return this.client.channels.fetch(
      IDs.MOD_LOGS,
      true,
    ) as Promise<TextChannel>;
  }

  async mute(data: PunishData, dm = DEFAULT_DM_VALUE): Promise<Infraction> {
    const modlog = new ModLog(this.client)
      .setOffender(data.offender)
      .setReason(data.reason)
      .setModerator(data.moderator)
      .setType(InfractionType.MUTE);

    if (data.duration) {
      modlog.setDuration(data.duration);
      await modlog.schedule();
    }

    await this.muteMember(data.offender, data.reason, modlog.duration?.ms, dm);
    return await modlog.finish();
  }

  async muteMember(
    member: GuildMember,
    reason: string,
    duration?: number | null,
    dm = DEFAULT_DM_VALUE,
  ) {
    if (dm) {
      const _duration = duration ? ms(duration, { long: true }) : null;
      const embed = Embed.Danger(
        `You've been muted in **MenuDocs** ${
          _duration ? `for **${_duration}**` : "permanently"
        }.\n${code`${reason}`}`,
      );

      await this.tryDm(member.user, embed);
    }

    await member.roles.add(IDs.MUTED);
  }

  async unmute(data: PunishData, removeRole = true) {
    const modlog = new ModLog(this.client)
      .setOffender(data.offender)
      .setModerator(data.moderator)
      .setReason(data.reason)
      .setType(InfractionType.UNMUTE);

    if (removeRole) {
      await data.offender.roles.remove(IDs.MUTED);
    }

    await Scheduler.get().cleanup("unmute", data.offender.id);
    return modlog.finish();
  }

  /**
   * Warns a user.
   * @param data The punishment data.
   * @param dm
   */
  async warn(data: PunishData, dm = DEFAULT_DM_VALUE): Promise<Infraction> {
    const modlog = new ModLog(this.client)
      .setReason(data.reason)
      .setOffender(data.offender)
      .setModerator(data.moderator)
      .setType(InfractionType.WARN);

    if (dm) {
      const embed = Embed.Danger(
        `You've been warned in ${data.offender.guild.name} for \`${data.reason}\``,
      );

      await this.tryDm(data.offender.user, embed);
    }

    const automated = await this.automation.runProfile(
      data.offender,
      null,
      true,
    );

    if (automated) {
      switch (automated.type) {
        case InfractionType.BAN:
          await this.banMember(
            data.offender,
            automated.reason,
            automated.duration?.ms,
            dm,
          );

          break;
        case InfractionType.MUTE:
          await this.muteMember(
            data.offender,
            automated.reason,
            automated.duration?.ms,
            dm,
          );

          break;
        case InfractionType.KICK:
          await this.kickMember(data.offender, automated.reason, dm);
          break;
      }

      await automated.finish();
      await automated.schedule(Date.now());
    }

    return modlog.finish();
  }

  /**
   * Kicks a user.
   * @param data The punishment data.
   * @param dm
   */
  async kick(data: PunishData, dm = DEFAULT_DM_VALUE): Promise<Infraction> {
    const modLog = new ModLog(this.client)
      .setReason(data.reason)
      .setOffender(data.offender)
      .setModerator(data.moderator)
      .setType(InfractionType.KICK);

    await this.kickMember(data.offender, data.reason, dm);
    return modLog.finish();
  }

  async kickMember(member: GuildMember, reason: string, dm = DEFAULT_DM_VALUE) {
    if (dm) {
      const embed = Embed.Danger(`You've been kicked from **MenuDocs** for: ${code`${reason}`}`);
      await this.tryDm(member.user, embed);
    }

    await member.kick(reason);
  }

  /**
   * Bans a user.
   * @param data The punishment data.
   * @param dm
   */
  async ban(data: PunishData, dm = DEFAULT_DM_VALUE) {
    const modLog = new ModLog(this.client)
      .setReason(data.reason)
      .setOffender(data.offender)
      .setModerator(data.moderator)
      .setType(InfractionType.BAN);

    if (data.duration) {
      modLog.setDuration(data.duration);
      await modLog.schedule();
    }

    await this.banMember(data.offender, data.reason, modLog.duration?.ms, dm);
    return modLog.finish();
  }

  async banMember(
    member: GuildMember,
    reason: string,
    duration?: number,
    dm = DEFAULT_DM_VALUE,
  ) {
    if (dm) {
      const _duration = duration ? ms(duration, { long: true }) : null;
      const desc = `You've been banned from **MenuDocs** ${_duration ? `for **${_duration}**` : "permanently"}.\n${code`${reason}`}`

      await this.tryDm(member.user, Embed.Danger(desc));
    }

    await member.ban({ days: 7, reason });
  }

  /**
   * Soft-bans a user.
   * @param data The punishment data.
   * @param dm
   */
  async softBan(data: PunishData, dm = DEFAULT_DM_VALUE) {
    const modLog = new ModLog(this.client)
      .setReason(data.reason)
      .setOffender(data.offender)
      .setModerator(data.moderator)
      .setType(InfractionType.SOFTBAN);

    if (data.duration) {
      modLog.setDuration(data.duration);
      await modLog.schedule();
    }

    await this.softBanMember(data.offender, data.reason, data.delDays = 7, dm);
    return modLog.finish();
  }

  async softBanMember(member: GuildMember, reason: string, delDays: number, dm = DEFAULT_DM_VALUE) {
    if (dm) {
      const embed = Embed.Danger(`You've been soft-banned from **MenuDocs**`,);
      await this.tryDm(member.user, embed);
    }

    await member.ban({ days: delDays, reason });
  }

  /**
   * Un-bans a user.
   * @param data The punishment data.
   * @param guild The guild instance.
   */
  async unban(data: PunishData<User>, guild: Guild) {
    try {
      const modLog = new ModLog(this.client)
        .setReason(data.reason)
        .setOffender(data.offender)
        .setModerator(data.moderator)
        .setType(InfractionType.UNBAN);

      await Scheduler.get().cleanup("unban", data.offender.id);
      await guild.members.unban(data.offender);

      return modLog.finish();
    } catch (e) {
      captureException(e);
    }
  }

  /**
   * Times out a user/blacklists them from help channels
   * @param data - the punsishment data
   * @param dm
   */
  async timeout(data: PunishData, dm = DEFAULT_DM_VALUE): Promise<Infraction> {
    const modlog = new ModLog(this.client)
      .setOffender(data.offender)
      .setReason(data.reason)
      .setModerator(data.moderator)
      .setType(InfractionType.TIMEOUT);

    if (data.duration) {
      modlog.setDuration(data.duration);
      await modlog.schedule();
    }

    await this.timeoutMember(data.offender, data.reason, modlog.duration?.ms, dm);
    return await modlog.finish();
  }

  async timeoutMember(
    member: GuildMember,
    reason: string,
    duration?: number | null,
    dm = DEFAULT_DM_VALUE,
  ) {
    if (dm) {
      const _duration = duration ? ms(duration, { long: true }) : null;

      const embed = Embed.Danger(
        `You've been timed out (blacklisted from help channels) in **MenuDocs** ${
          _duration ? `for **${_duration}**` : "permanently"
        }.\n${code`${reason}`}`,
      );

      await this.tryDm(member.user, embed);
    }

    await member.roles.add(IDs.TIMED_OUT); // NEED TO CREATE AN ACTUAL ROLE FOR THIS
  }

  protected async tryDm(user: User, ...args: any[]): Promise<Message | undefined> {
    try {
      // @ts-expect-error
      return await user.send(...args);
    } catch (e) {
      void e;
      return;
    }
  }
}

export interface PunishData<O = GuildMember> {
  offender: O;
  moderator: GuildMember | User | "automod";
  reason: string;
  type?: InfractionType;
  delDays?: number;
  duration?: number | string;
}
