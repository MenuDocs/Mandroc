import ms from "ms";
import { Infraction, InfractionType, Prisma } from "@prisma/client";
import { GuildMember, MessageEmbed, User } from "discord.js";

import { Color, imageUrlOptions } from "../util";
import { Moderation } from "./Moderation";
import { Database } from "../database/Database";

import { Scheduler } from "../scheduler/Scheduler";

import type { Mandroc } from "../Client";

export class ModLog {
  static TEMPORARY: InfractionType[] = [
    InfractionType.Mute,
    InfractionType.Ban
  ];

  /**
   * The person punishing. 😈
   */
  moderator!: Moderator;

  /**
   * The user being punished.
   */
  offender!: Offender;

  /**
   * The type of punishment.
   */
  type!: InfractionType;

  /**
   * Reason for the punishment.
   */
  reason!: string;

  /**
   * The duration of the punishment.
   */
  duration?: Duration;

  /**
   * Whether this action caused an automated one.
   */
  causedAutomated?: number;

  /**
   * The current case id.
   * @private
   */
  #caseId?: number;

  /**
   * The client.
   * @private
   */
  readonly #client: Mandroc;

  /**
   * @param client The mandroc client.
   */
  constructor(client: Mandroc) {
    this.#client = client;
  }

  /**
   * Whether this mod log is postable.
   */
  get postable() {
    return (
      this.reason &&
      this.moderator.section &&
      this.offender.section &&
      typeof this.#caseId !== "undefined" &&
      this.type
    );
  }

  /**
   * The infraction.
   */
  get infraction(): Prisma.XOR<Prisma.InfractionCreateInput, Prisma.InfractionUncheckedCreateInput> {
    const meta: InfractionMeta = {
      automod: !this.moderator.id,
      causedAutomated: this.causedAutomated,
      edits: [],
      duration: this.duration?.ms
    };

    return {
      id: this.#caseId,
      type: this.type,
      offenderId: this.offender.id,
      moderatorId: this.moderator.id ?? "AutoMod",
      reason: this.reason,
      meta
    };
  }

  static async fromInfraction(
    client: Mandroc,
    infraction: Infraction
  ): Promise<ModLog> {
    const modLog = new ModLog(client)
      .setType(infraction.type)
      .setOffender(await client.users.fetch(infraction.offenderId))
      .setModerator(await client.users.fetch(infraction.moderatorId))
      .setReason(infraction.reason);

    const meta = infraction.meta as InfractionMeta;
    if (meta.duration) {
      modLog.setDuration(meta.duration);
    }

    return modLog;
  }

  /**
   * Parses the provided reason for an embed.
   * @param reason The reason.
   */
  static async parseReason(reason: string): Promise<string> {
    for (const [ text, id ] of reason.matchAll(/#(\d+)/gi)) {
      const infraction = await Database.PRISMA.infraction.findFirst({
        where: { id: +id },
        select: { messageId: true }
      });

      if (!infraction) {
        continue
      }

      reason = reason.replace(text, `[#${id}](${Moderation.lcUrl}/${infraction.messageId})`)
    }

    return reason;
  }

  /**
   * The mod log embed.
   */
  async getEmbed() {
    let color;
    switch (this.type) {
      case InfractionType.Kick:
      case InfractionType.Warn:
        color = Color.Warning;
        break;
      case InfractionType.Mute:
      case InfractionType.Timeout:
      case InfractionType.UnMute:
        color = Color.Intermediate;
        break;
      case InfractionType.Ban:
      case InfractionType.SoftBan:
      case InfractionType.UnBan:
        color = Color.Danger;
        break;
    }

    const offender = this.#client.users.cache.get(this.offender.id),
      embed = new MessageEmbed()
        .setColor(color)
        .setTimestamp(Date.now())
        .setAuthor(
          `Moderation: ${this.type.capitalize()} (Case: ${this.#caseId})`
        )
        .setDescription(
          [
            `**Moderator:** ${this.moderator.section}`,
            `**Offender:** ${this.offender.section}`,
            this.duration?.section,
            `**Reason:** ${await ModLog.parseReason(this.reason)}`
          ].filter(Boolean)
        );

    if (offender) {
      embed.setAuthor(
        `Moderation: ${this.type.capitalize()} (Case: ${this.#caseId})`,
        offender.displayAvatarURL(imageUrlOptions)
      );
    }

    return embed;
  }

  /**
   * Schedules the offender to be either unmuted or unbanned.
   * @param startDate The starting date in which to use when computing the unmute or unban date
   */
  async schedule(startDate = Date.now()) {
    await this.assignCaseId();
    if (
      this.postable &&
      this.duration &&
      ModLog.TEMPORARY.includes(this.type)
    ) {
      await Scheduler.get().schedule(
        this.type === InfractionType.Mute ? "unmute" : "unban",
        startDate + this.duration.ms,
        this.offender.id,
        {
          offenderId: this.offender.id,
          caseId: this.#caseId!!
        }
      );
    }
  }

  /**
   * Sets the case id.
   */
  async assignCaseId(): Promise<number> {
    if (!this.#caseId) {
      this.#caseId = await Database.nextInfractionId();
    }

    return this.#caseId;
  }

  /**
   * Set the mod log duration.
   * @param {}duration
   */
  setDuration(duration: string | number): ModLog {
    const ms_ = typeof duration === "string" ? ms(duration) : duration;

    this.duration = {
      ms: ms_,
      section: `**Duration:** ${ms(ms_, { long: true })}`
    };

    return this;
  }

  /**
   * Set the moderator, required.
   * @param moderator The moderator obj.
   */
  setModerator(moderator: User | GuildMember | "automod"): ModLog {
    switch (moderator) {
      case "automod":
        this.moderator = {
          section: "AutoMod™️",
          id: null,
          tag: null
        };

        break;
      default:
        const user = "user" in moderator ? moderator.user : moderator;
        this.moderator = {
          section: `${user.tag} \`(${user.id})\``,
          id: user.id ?? null,
          tag: user.tag ?? null
        };

        break;
    }

    return this;
  }

  /**
   * Set the infraction type, required.
   * @param type The infraction type.
   */
  setType(type: InfractionType): ModLog {
    this.type = type;
    return this;
  }

  /**
   * Set the moderator, required.
   * @param offender The moderator obj.
   */
  setOffender(offender: User | GuildMember): ModLog {
    const user = "user" in offender ? offender.user : offender;

    this.offender = {
      section: `${user.tag} \`(${user.id})\``,
      id: user.id,
      tag: user.tag
    };

    return this;
  }

  /**
   * Sets the mod log reason.
   * @param reason Reason for this mod log
   */
  setReason(reason: string): ModLog {
    this.reason = reason;
    return this;
  }

  async post(): Promise<string> {
    // (0) Get the mod logs channel.
    const channel = await this.#client.moderation.logChannel();

    // (1) Check if the infraction is postable.
    if (!this.postable) {
      throw "This mod log isn't postable.";
    }

    if (!channel) {
      throw "Can't find the mod logs channel.";
    }

    // (2) Send the channel and set the message id.
    const message = await channel.send(await this.getEmbed());

    // (3) Return message id.
    return message.id;
  }

  /**
   * Posts this mod log to the mod logs channel.
   */
  async finish(): Promise<Infraction> {
    // (0) Assign case ID.
    await this.assignCaseId();
    if (!this.postable) {
      throw "This mod log isn't postable.";
    }

    // (1) Assign Infraction Message ID.
    const infraction = this.infraction;
    infraction.messageId = await this.post();

    // (3) Save the infraction
    return await Database.PRISMA.infraction.create({
      data: infraction,
    });
  }
}

interface Offender {
  id: string;
  tag: string;
  section: string;
}

interface Moderator {
  id: string | null;
  tag: string | null;
  section: string;
}

interface Duration {
  ms: number;
  section: string;
}

export interface InfractionEdit extends Prisma.JsonObject {
  id: string;
  method: "reason";
  contents: string;
  at: number;
}

export interface InfractionMeta extends Prisma.JsonObject {
  duration?: number;
  edits: InfractionEdit[];
  pardon?: string;
  automod: boolean;
  causedAutomated?: number;
}
