import { BaseEntity, Column, DeepPartial, Entity, FindConditions, FindOneOptions } from "typeorm";
import { Infraction, InfractionType } from "./infraction.entity";
import { Item, ItemModifier, ItemType } from "./item.entity";

@Entity("profiles")
export class Profile extends BaseEntity {
  @Column({ type: "string" })
  userId!: string;

  @Column({ type: "number", default: 0 })
  pocket: number = 0;

  @Column({ type: "number", default: 0 })
  bank: number = 0;

  @Column({ type: "number", default: 0 })
  xp: number = 0;

  @Column({ type: "number", default: 1 })
  level: number = 1;

  @Column({ type: "json", default: { xp: null, coin: null } })
  boosters: ProfileBoosters = { xp: null, coin: null };

  @Column({ type: "array" })
  badges: string[] = [];

  @Column({ type: "string", nullable: true })
  bodyguard?: BodyguardTier;

  @Column({ type: "array" })
  repBy: string[] = [];

  @Column({ type: "long", nullable: true })
  lastRobbed: number | null = null;

  @Column({ type: "long", nullable: true })
  lastDaily: number | null = null;

  @Column({ type: "long", nullable: true })
  lastWeekly: number | null = null;

  @Column({ type: "long", nullable: true })
  lastWorked: number | null = null;

  @Column({ type: "long", nullable: true })
  lastChopped: number | null = null;

  @Column({ type: "long", nullable: true })
  lastMined: number | null = null;

  @Column({ type: "long", nullable: true })
  lastFished: number | null = null;

  @Column({ type: "long", nullable: true })
  lastShoveled: number | null = null;

  @Column({ type: "array", default: [] })
  inventory: InventoryItem[] = [];

  @Column({ type: "boolean", default: false })
  blocked?: boolean = false;

  @Column({ type: "array", default: [] })
  notes?: { note: string; issuer: string }[] = [];

  /**
   * Attempts to find a document using the provided options, if nothing is found it will create a new document using the provided data.
   *
   * @param options The options to use when finding or creating a new document.
   *
   * @returns The found/created document.
   */
  static findOneOrCreate(
    options: FindOneOptions<Profile> & { create?: DeepPartial<Profile> }
  ): Promise<Profile> {
    return new Promise((res, rej) => {
      return this.findOne(options)
        .then(p => res(p ?? (options.create ? this.create(options.create) : this.create())))
        .catch(rej);
    });
  }

  /**
   * Returns the number of infractions the User of this Profile has.
   */
  async getInfractionCount(type?: InfractionType): Promise<number> {
    const where: FindConditions<Infraction> = {
      offenderId: this.userId
    };

    if (type) {
      where.type = type;
    }

    return Infraction.findAndCount(where).then(([, c]) => c);
  }

  /**
   * The boosters this user has redeemed.
   */
  async getBoosters(): Promise<Record<BoosterType, number>> {
    return {
      xp: await this.getBooster("xp"),
      coin: await this.getBooster("coin")
    }
  }

  /**
   * Gets the booster for the provided type
   *
   * @param type Booster type
   */
  async getBooster(type: BoosterType): Promise<number> {
    const item = await this.findBooster(type);
    if (!item) {
      this.boosters[type] = null;
      this.save().catch(e => void e);
      return 1;
    }

    return item.getModifierMetadata<ItemModifier.Booster>().amount;
  }

  /**
   * Finds a booster {@link Item}, using the ID of an inventory item.
   *
   * @param id Inventory item id.
   */
  private async findBooster(id: string): Promise<Item<ItemType.Redeemable> | null> {
    const itemId = this.inventory.find(i => i.id === id)?.item;
    if (!itemId) {
      return null;
    }

    const booster = await Item.findItem<ItemType.Redeemable>({
      id: itemId,
      type: ItemType.Redeemable,
      modifier: ItemModifier.Booster
    })

    return booster ?? null;
  }
}

export type BoosterType = "xp" | "coin";

export type BodyguardTier = "rookie" | "gold" | "deluxe" | "chad";

export type ToolType = "shovel" | "pickaxe" | "axe";

export interface InventoryItem {
  /**
   * ID of the item
   */
  item: string;

  /**
   * Unique ID for this item, can be used to e.g. identify which booster does what
   */
  id: string;

  /**
   * The metadata of this item.
   */
  metadata?: any;
}

export type ProfileBoosters = Record<BoosterType, string | null>;
