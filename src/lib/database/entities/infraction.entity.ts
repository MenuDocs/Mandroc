import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

export enum InfractionType {
  Warn = "warn",
  Ban = "ban",
  Kick = "kick",
  Mute = "mute"
}

@Entity("infractions")
export class Infraction extends BaseEntity {
  @PrimaryColumn({ default: 0 })
  _id!: number;

  @Column()
  offender!: string;

  @Column()
  moderator!: string;

  @Column()
  reason!: string;

  @Column("date", { default: () => new Date() })
  createdAt!: Date;

  @Column("enum", { enum: InfractionType })
  type!: InfractionType;

  @Column({ default: {} })
  meta!: Dictionary;

  @Column()
  messageId!: string;
}
