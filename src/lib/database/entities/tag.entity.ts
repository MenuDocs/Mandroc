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

  @Column("string")
  public name!: string;

  @Column("string")
  public authorId!: string;

  @Column("string")
  public contents!: string;

  @Column("number", { default: 0 })
  public uses: number = 0;

  @Column("string", { default: "general" })
  public category!: string;

  @Column("array", { default: [] })
  public aliases: string[] = [];

  @Column("timestamp", { default: () => Date.now() })
  public createdAt: number = Date.now();

  @Column("boolean", { default: false })
  public embedded: boolean = false;

  @Column("json", { default: DEFAULT_TAG_PERMISSIONS })
  public perms: TagPermissions = DEFAULT_TAG_PERMISSIONS;
}

interface TagPermissions {
  supportOnly: boolean;
  staffOnly: boolean;
  roles: string[];
}
