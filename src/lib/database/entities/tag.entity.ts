import { BaseEntity, Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";

export const DEFAULT_TAG_PERMISSIONS: TagPermissions = {
  roles: [],
  staffOnly: false,
  supportOnly: true,
};

@Entity("tags")
export class Tag extends BaseEntity {
  @ObjectIdColumn()
  _id!: ObjectID;

  @Column()
  public name!: string;

  @Column()
  public authorId!: string;

  @Column()
  public contents!: string;

  @Column({ default: 0 })
  public uses: number = 0;

  @Column({ default: "general" })
  public category!: string;

  @Column({ type: "array", default: [] })
  public aliases: string[] = [];

  @Column({ type: "timestamp", default: () => Date.now() })
  public createdAt: number = Date.now();

  @Column({ default: false })
  public embedded: boolean = false;

  @Column("json", { default: DEFAULT_TAG_PERMISSIONS })
  public perms: TagPermissions = DEFAULT_TAG_PERMISSIONS;
}

interface TagPermissions {
  supportOnly: boolean;
  staffOnly: boolean;
  roles: string[];
}
