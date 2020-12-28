/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { BaseEntity, Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";

@Entity("reactionRoles")
export class ReactionRole extends BaseEntity {
  @ObjectIdColumn()
  _id!: ObjectID;

  @Column({ generated: "uuid" })
  id!: number;

  @Column()
  emoji!: string;

  @Column()
  messageId!: string;

  @Column()
  roleId!: string;

  @Column({ default: false })
  removeReaction: boolean = false;
}
