/*
 * Copyright (c) MenuDocs 2021.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { BaseEntity, Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";

@Entity("badges")
export class Badge extends BaseEntity {
  @ObjectIdColumn()
  _id!: ObjectID;

  @Column()
  name!: string;

  @Column()
  authorId!: string;

  @Column()
  emojiId!: string;

  @Column({ default: () => Date.now() })
  createdAt!: number;
}
