/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import {
  BaseEntity,
  Column,
  DeepPartial,
  Entity,
  FindConditions,
  FindOneOptions,
  ObjectID,
  ObjectIdColumn,
} from "typeorm";
import { Infraction, InfractionType } from "./infraction.entity";

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
  boosters: ProfileBoosters = {
    xp: 1,
    coin: 1,
  };

  @Column("array")
  badges: string[] = [];

  @Column("string", { nullable: true })
  bodyguard?: BodyguardTier;

  @Column("array")
  repBy: string[] = [];

  @Column({ nullable: true })
  lastRobbed?: number | null = null;

  @Column({ nullable: true })
  lastDaily?: number | null = null;

  @Column({ nullable: true })
  lastWeekly?: number | null = null;

  @Column({ nullable: true })
  lastWorked?: number | null = null;

  @Column({ nullable: true })
  lastChopped?: number | null = null;

  @Column({ nullable: true })
  lastMined?: number | null = null;

  @Column({ nullable: true })
  lastFished?: number | null = null;

  @Column({ nullable: true })
  lastShoveled?: number | null = null;

  @Column("array", { default: [] })
  inventory: Array<Tool> = [];

  @Column("boolean", { default: false })
  blocked?: boolean = false;

  @Column("array", { default: [] })
  notes?: { note: string; issuer: string }[] = [];

  /**
   * Attempts to find a document using the provided options, if nothing is found it will create a new document using the provided data.
   * @param options The options to use when finding or creating a new document.
   * @returns The found/created document.
   */
  static findOneOrCreate(
    options: FindOneOptions<Profile> & { create?: DeepPartial<Profile> },
  ): Promise<Profile> {
    return new Promise((res, rej) => {
      return this.findOne(options)
        .then((p) =>
          res(
            p ?? (options.create ? this.create(options.create) : this.create()),
          ),
        )
        .catch(rej);
    });
  }

  /**
   * Returns the number of infractions the User of this Profile has.
   */
  async getInfractionCount(type?: InfractionType): Promise<number> {
    const where: FindConditions<Infraction> = {
      offenderId: this.userId,
    };

    if (type) {
      where.type = type;
    }

    return Infraction.findAndCount(where).then(([ , c ]) => c);
  }
}

export type BodyguardTier = "rookie" | "gold" | "deluxe" | "chad";

export type ItemTier = "basic" | "common" | "rare" | "exotic";

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


export interface ProfileBoosters {
  coin: number;
  xp: number;
}
