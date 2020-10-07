import { GuildMember, MessageEmbed, User } from "discord.js";
import { Color, imageUrlOptions, Infraction, InfractionType, Mandroc } from "@lib";
import ms from "ms";

export class ModLog {

  /**
   * The person punishing. 😈
   */
  public moderator!: Moderator;

  /**
   * The user being punished.
   */
  public offender!: Offender;

  /**
   * The type of punishment.
   */
  public type!: InfractionType;

  /**
   * Reason for the punishment.
   */
  public reason!: string;

  /**
   * The duration of the punishment.
   */
  public duration?: Duration;

  /**
   * The infraction id.
   * @private
   */
  #caseId?: number;

  /**
   * The client.
   * @private
   */
  readonly #client: Mandroc;

  public constructor(client: Mandroc) {
    this.#client = client;
  }

  /**
   * The mod log embed.
   */
  public get embed() {
    const color = [ InfractionType.Warn, InfractionType.Mute ].includes(this.type)
      ? Color.Warning
      : Color.Danger;

    const offender = this.#client.users.cache.get(this.offender.id),
      embed = new MessageEmbed()
        .setColor(color)
        .setAuthor(`Moderation: ${this.type.capitalize()} (Case: ${this.#caseId})`)
        .setDescription([
          `**Moderator**: ${this.moderator.section}`,
          `**Offender**: ${this.offender.section}`,
          `**Reason**: ${this.reason}`,
          this.duration?.section
        ].filter(Boolean));

    if (offender) {
      embed.setAuthor(
        `Moderation: ${this.type.capitalize()} (Case: ${this.#caseId})`,
        offender.displayAvatarURL(imageUrlOptions)
      );
    }

    return embed;
  }

  /**
   * Whether this mod log is postable.
   */
  public get postable() {
    return (
      this.reason
      && this.moderator.section
      && this.offender.section
      && this.#caseId
      && this.type
    );
  }

  /**
   * The infraction.
   */
  public get infraction() {
    const meta = {} as Dictionary;
    if (this.duration) meta.duration = this.duration.ms;
    if (!this.moderator.id) meta.automod = true;

    return Infraction.create({
      _id: this.#caseId,
      type: this.type,
      offender: this.offender.id,
      moderator: this.moderator.id ?? "AutoMod",
      reason: this.reason,
      meta
    });
  }

  /**
   * Sets the case id.
   */
  public async assignCaseId(): Promise<number> {
    if (!this.#caseId) {
      const id = await this.#client.redis.incrementInfractions();
      this.#caseId = id;
      return id;
    }

    return this.#caseId;
  }

  /**
   * Set the mod log duration.
   * @param {}duration
   */
  public setDuration(duration: string | number): ModLog {
    const ms_ = typeof duration === "string"
      ? ms(duration)
      : duration;

    this.duration = {
      ms: ms_,
      section: `**Duration**: ${ms(ms_, { long: true })}`
    };

    return this;
  }

  /**
   * Set the moderator, required.
   * @param moderator The moderator obj.
   */
  public setModerator(moderator: User | GuildMember | "automod"): ModLog {
    if (moderator !== "automod") {
      const user = "user" in moderator
        ? moderator.user
        : moderator;

      this.moderator = {
        section: `${user.tag} \`(${user.id})\``,
        id: user.id ?? null,
        tag: user.tag ?? null
      };

      return this;
    }

    this.moderator = {
      section: "AutoMod",
      id: null,
      tag: null
    };

    return this;
  }

  /**
   * Set the infraction type, required.
   * @param type The infraction type.
   */
  public setType(type: InfractionType): ModLog {
    this.type = type;
    return this;
  }

  /**
   * Set the moderator, required.
   * @param offender The moderator obj.
   */
  public setOffender(offender: User | GuildMember): ModLog {
    const user = "user" in offender
      ? offender.user
      : offender;

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
  public setReason(reason: string): ModLog {
    this.reason = reason;
    return this;
  }

  /**
   * Posts this mod log to the mod logs channel.
   */
  public async post(): Promise<Infraction> {
    // (0) Get the mod logs channel.
    const channel = await this.#client.moderation.logChannel();

    // (1) Check if the infraction is postable.
    await this.assignCaseId();
    if (!this.postable) throw "This mod log isn't postable.";
    if (!channel) throw "Can't find the mod logs channel.";

    // (2) Send the channel and set the message id.
    const message = await channel.send(this.embed);
    const infraction = this.infraction;
    infraction.messageId = message.id;

    // (3) Save the infraction
    await infraction.save();

    return infraction;
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
