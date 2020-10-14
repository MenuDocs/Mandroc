import type { BodyguardTier } from "../database/entities/profile.entity";
import type { ImageURLOptions } from "discord.js";
import { PermissionLevel } from "../classes/Command";

export const IDS = {
  GUILD: "762898486571827232",
  MOD_LOGS: "762898487700094992",
  ROLES: {
    [PermissionLevel.Member]: "Verified Member",
    [PermissionLevel.Donator]: "762898486923886611",
    [PermissionLevel.Helper]: "762898486932013056",
    [PermissionLevel.TrialMod]: "762898486945251328",
    [PermissionLevel.Mod]: "762898486945251332",
    [PermissionLevel.Admin]: "762898486945251335",
    [PermissionLevel.Management]: "762898486956916747",
  } as Record<PermissionLevel, string>,
  Unverified: "762898486571827235",
};

export const imageUrlOptions = {
  dynamic: true,
  size: 4096,
  format: "png",
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
