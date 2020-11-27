/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { Property } from "@mikro-orm/core";
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

  @Property({ type: "number" })
  id!: number;

  @Property({ type: "string" })
  offender!: string;

  @Property({ type: "string" })
  moderator!: string;

  @Property("string")
  reason!: string;

  @Property({ type: "timestamp", default: Date.now() })
  createdAt: number = Date.now();

  @Property({ type: "string" })
  type!: InfractionType;

  @Column({ default: {} })
  meta: Dictionary = {};

  @Property({ columnType: "string",  nullable: true  })
  messageId!: string | null;
}
