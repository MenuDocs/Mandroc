import { BaseEntity, Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";

@Entity("profiles")
export class Profile extends BaseEntity {
  @ObjectIdColumn()
  _id!: ObjectID;

  @Column()
  userId!: string;

  @Column({ default: 0 })
  pocket!: number;

  @Column({ default: 0 })
  bank!: number;

  @Column({ default: 0 })
  xp!: number;

  @Column({ default: 1 })
  level!: number;

  @Column({ default: 0,  })
  boosters!: number;

  @Column({ type: "string", nullable: true })
  bodyguard?: BodyguardTier;
}

export type BodyguardTier = "rookie" | "gold" | "deluxe" | "chad";
