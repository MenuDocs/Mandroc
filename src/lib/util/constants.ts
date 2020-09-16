import type { BodyguardTier } from "../database/entities/profile.entity";

export const bodyguardTiers: Record<BodyguardTier, BodyguardStats> = {
  rookie: {
    price: 1000,
    safe: .31
  },
  gold: {
    price: 2500,
    safe: .62
  },
  deluxe: {
    price: 3000,
    safe: .73
  },
  chad: {
    price: 5000,
    safe: .9
  }
}

export interface BodyguardStats {
  price: number;
  safe: number;
}
