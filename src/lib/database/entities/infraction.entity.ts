/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { BaseEntity, Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";

export enum InfractionType {
  WARN = "warn",
  BAN = "ban",
  SOFTBAN = "softban",
  KICK = "kick",
  MUTE = "mute",
  UNBAN = "unban",
  UNMUTE = "unmute",
  TIMEOUT = "timeout"
}

@Entity("infractions")
export class Infraction extends BaseEntity {
  @ObjectIdColumn()
  _id!: ObjectID;

  @Column()
  id!: number;

  @Column()
  offenderId!: string;

  @Column()
  moderatorId!: string;

  @Column({
    type: "string",
    nullable: true,
  })
  messageId!: string | null;

  @Column()
  reason!: string;

  @Column({
    type: "timestamp",
    default: Date.now(),
  })
  createdAt: number = Date.now();

  @Column({
    type: "enum",
    enum: InfractionType,
  })
  type!: InfractionType;

  @Column({
    type: "json",
    default: {},
  })
  meta: Dictionary = {};

  /**
   * Returns the next Case ID.
   */
  static async nextId(): Promise<number> {
    return (await this.count()) + 1;
  }
}
