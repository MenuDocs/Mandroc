import type { BodyguardTier } from "../database/entities/profile.entity";
import type { ImageURLOptions } from "discord.js";

export const IDS = {
  GUILD: "416512197590777857",
  MOD_LOGS: "615083453196664865"
}

export const imageUrlOptions = {
  dynamic: true,
  size: 4096,
  format: "png"
} as ImageURLOptions;

export const bodyguardTiers: Record<BodyguardTier, BodyguardStats> = {
  rookie: {
    price: 1000,
    safe: 0.31,
  },
  gold: {
    price: 2500,
    safe: 0.62,
  },
  deluxe: {
    price: 3000,
    safe: 0.73,
  },
  chad: {
    price: 5000,
    safe: 0.9,
  },
};

export enum Color {
  Primary = 0x5e72e4,
  Danger = 0xf5365c,
  Success = 0x2dce89,
  Warning = 0xfb6340,
}

export interface BodyguardStats {
  price: number;
  safe: number;
}
