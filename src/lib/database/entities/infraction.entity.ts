import { BaseEntity, Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";

export enum InfractionType {
  Warn = "warn",
  Ban = "ban",
  Kick = "kick",
  Mute = "mute",
}

@Entity("infractions")
export class Infraction extends BaseEntity {
  @ObjectIdColumn()
  _id!: ObjectID;

  @Column({ type: "number", default: 0 })
  id!: number;

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

  @Column({ nullable: true })
  messageId!: string | null;
}
