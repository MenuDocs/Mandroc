/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

import type { ObjectId } from "@mikro-orm/mongodb";

@Entity({ collection: "profiles" })
export class Profile {
  @PrimaryKey()
  _id!: ObjectId;

  @Property({ columnType: "string" })
  userId!: string;

  @Property({ columnType: "number", default: 0 })
  pocket: number = 0;

  @Property({ columnType: "number", default: 0 })
  bank: number = 0;

  @Property({ columnType: "number", default: 0 })
  xp: number = 0;

  @Property({ columnType: "number", default: 1 })
  level: number = 1;

  @Property({ columnType: "number", default: 0 })
  boosters: number = 0;

  @Property({ columnType: "string", nullable: true })
  bodyguard?: BodyguardTier;

  @Property({ columnType: "number", default: 0 })
  infractions: number = 0;

  @Property({ columnType: "array" })
  repBy: string[] = [];
}

export type BodyguardTier = "rookie" | "gold" | "deluxe" | "chad";
