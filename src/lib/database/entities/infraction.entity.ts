/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

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

  @Column("number", { generated: "increment" })
  id!: number;

  @Column("string")
  offender!: string;

  @Column("string")
  moderator!: string;

  @Column("string")
  reason!: string;

  @Column("timestamp", { default: () => Date.now() })
  createdAt: number = Date.now();

  @Column("enum", { enum: InfractionType })
  type!: InfractionType;

  @Column("json", { default: {} })
  meta: Dictionary = {};

  @Column("string", { nullable: true })
  messageId!: string | null;
}
