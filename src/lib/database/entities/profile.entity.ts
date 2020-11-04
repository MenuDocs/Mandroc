/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { BaseEntity, Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";

@Entity("profiles")
export class Profile extends BaseEntity {
  @ObjectIdColumn()
  _id!: ObjectID;

  @Column("string")
  userId!: string;

  @Column("number", { default: 0 })
  pocket: number = 0;

  @Column("number", { default: 0 })
  bank: number = 0;

  @Column("number", { default: 0 })
  xp: number = 0;

  @Column("number", { default: 1 })
  level: number = 1;

  @Column("number", { default: 0 })
  boosters: number = 0;

  @Column("string", { nullable: true })
  bodyguard?: BodyguardTier;

  @Column("number", { default: 0 })
  infractions: number = 0;

  @Column("array")
  repBy: string[] = [];
}

export type BodyguardTier = "rookie" | "gold" | "deluxe" | "chad";
