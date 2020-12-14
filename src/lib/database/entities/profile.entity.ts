/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { Column, BaseEntity, Entity, ObjectIdColumn, ObjectID } from "typeorm";

@Entity("profiles")
export class Profile extends BaseEntity {
  @ObjectIdColumn()
  _id!: ObjectID;

  @Column()
  userId!: string;

  @Column({ default: 0 })
  pocket: number = 0;

  @Column({ default: 0 })
  bank: number = 0;

  @Column({ default: 0 })
  xp: number = 0;

  @Column({ default: 1 })
  level: number = 1;

  @Column({ default: 0 })
  boosters: number = 0;

  @Column({ type: "string", nullable: true })
  bodyguard?: BodyguardTier;

  @Column({ default: 0 })
  infractions: number = 0;

  @Column({ type: "array" })
  repBy: string[] = [];

  @Column({ type: "string", default: null })
  lastRobbedDateString?: string | null = null;

  @Column({ type: "array", default: [] })
  inventory: Array<Tool> = [];
}

export type BodyguardTier = "rookie" | "gold" | "deluxe" | "chad";
export type ItemTier = "Basic" | "Common" | "Rare" | "Exotic";

export interface Tool {
  name: string;
  durability: number;
}

export interface Item {
  name: string;
  price: number;
  tier: ItemTier;
}

export type Tools = "Fishing Rod";
