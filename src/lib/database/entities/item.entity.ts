import { BaseEntity, Column, Entity, FindConditions, ObjectLiteral } from "typeorm";

import type { BoosterType, ToolType } from "@lib";

export enum ItemModifier {
  /**
   * The item will boost something, e.g. amount of coins earned by a game, amount of xp earned by talking.
   */
  Booster,

  /**
   * The item will act as a bodyguard, meaning anyone trying to rob the owner will have a harder time getting anything out of it
   */
  Bodyguard
}

export enum ItemType {
  /**
   * This item is meant to be redeemed, it usually gets paired with a modifier.
   */
  Redeemable,

  /**
   * This item is used as a tool, e.g. an axe, pickaxe, or shovel
   */
  Tool,

  /**
   * This item is used to show ownership of something, used for something like a bodyguard.
   */
  Document,

  /**
   * Unknown item type. *only used for typings*
   */
  Unknown
}

@Entity("items")
export class Item<T extends ItemType = ItemType.Unknown> extends BaseEntity {
  /**
   * The ID of this item, used within the shop or user inventories.
   *
   * @Example
   * `change_nickname`
   */
  @Column({ type: "text" }) id!: string;

  /**
   * The name of this item
   */
  @Column({ type:"text" }) name!: string

  /**
   * The type of this item
   */
  @Column({ type: "enum", enum: ItemType }) type!: T;

  /**
   * A modifier of this item. these are for items that have a special purpose, such as boosting the amount of coins a user gets
   */
  @Column({ type: "enum", enum: ItemModifier, nullable: true }) modifier?: ItemModifier;

  /**
   * The metadata for {@see modifier}, must be JSON
   */
  @Column({ type: "json", nullable: true, name: "modifier_metadata" }) modifierMetadata?: any;

  /**
   * The metadata of this item. The type of data stored varies on what type of item this is.
   */
  @Column({ type: "json" }) metadata?: ItemMetadata[T];

  /**
   * Convenience method to find items cleaner.
   *
   * @param {Omit<FindConditions<Item>, "id">} where
   */
  static async findItem<T extends ItemType>(where: FindConditions<Item<T>> | ObjectLiteral): Promise<Item<T> | undefined> {
    return await this.findOne({ where }) as Item<T> | undefined
  }

  //  TODO: fix your fucking comments (@melike2d)
  /**
   * Returns the {@link modifierMetadata} typed to it's respective data.
   * @returns {ModifierData[M]}
   */
  getModifierMetadata<M extends ItemModifier>(): ModifierData[M] {
    return this.modifierMetadata;
  }
}

interface ModifierData {
  [ItemModifier.Bodyguard]: { rob_chance: number; }
  [ItemModifier.Booster]: {
    amount: number;
    type: BoosterType;
  }
}

type ItemMetadata = {
  [ItemType.Redeemable]: {
    redeemed: boolean;
  }

  [ItemType.Document]: {}

  [ItemType.Tool]: {
    durability: string;
    type: ToolType
  }

  [ItemType.Unknown]: any;
}
