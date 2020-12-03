/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { Column, BaseEntity, Entity, ObjectID, ObjectIdColumn } from "typeorm";

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

  @Column()
  id!: number;

  @Column()
  offender!: string;

  @Column()
  moderator!: string;

  @Column()
  reason!: string;

  @Column({ type: "timestamp", default: Date.now() })
  createdAt: number = Date.now();

  @Column({ type: "enum", enum: InfractionType })
  type!: InfractionType;

  @Column({ type: "json", default: {} })
  meta: Dictionary = {};

  @Column({ type: "string", nullable: true })
  messageId!: string | null;
}
