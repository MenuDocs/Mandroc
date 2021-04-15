import { BaseEntity, Column, Entity } from "typeorm";

@Entity("shop_items")
export class ShopItem extends BaseEntity {
  /**
   * ID of the item this shop item points to
   */
  @Column({ type: "text", name: "item_id" }) itemId!: string

  /**
   * Whether the bought should be automatically redeemed.
   */
  @Column({ type: "boolean", name: "auto_redeem" }) autoRedeem!: boolean;

  /**
   * The price of this item
   */
  @Column({ type: "long" }) price!: number;

  /**
   * The category that this shop item is in.
   */
  @Column({ type: "text" }) category!: string;
}
