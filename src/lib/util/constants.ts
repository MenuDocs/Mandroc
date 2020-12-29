/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { PermissionLevel } from "../classes/Command";

import type { ImageURLOptions } from "discord.js";
import type { BodyguardTier } from "../database/entities/profile.entity";

export const IDs = {
  GUILD: "762898486571827232",
  MOD_LOGS: "762898487700094992",
  PROJECTIONS: "762898487700094993",
  VERIFICATION_MESSAGE: "784139980737216562",
  LOG_CHANNEL: "762898487201234997",
  MUTED: "762898486932013061",
  ACTION_QUEUE: "790909692313993217",
  SUGGESTIONS: "762898487372677130",
  VOICE_TEXT_CHANNEL: "762898487700094988",
  LEVELS: {
    10: "762898486911827984",
    20: "762898486911827985",
    30: "762898486911827986",
    40: "762898486911827987",
    50: "762898486923886602",
    60: "762898486923886603",
    70: "762898486923886604",
    80: "762898486923886605",
    90: "762898486923886606",
    100: "762898486923886607",
  } as Record<number, string>,
  PERMISSIONS: {
    [PermissionLevel.MEMBER]: "Verified Member",
    [PermissionLevel.DONATOR]: "762898486923886611",
    [PermissionLevel.HELPER]: "762898486932013056",
    [PermissionLevel.TRIAL_MOD]: "762898486945251328",
    [PermissionLevel.MOD]: "762898486945251332",
    [PermissionLevel.ADMIN]: "762898486945251335",
    [PermissionLevel.LOWER_MANAGEMENT]: "762898486945251337",
    [PermissionLevel.MANAGEMENT]: "762898486956916747",
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
    price: 5000,
    safe: 0.62,
  },
  deluxe: {
    price: 10000,
    safe: 0.73,
  },
  chad: {
    price: 20000,
    safe: 0.9,
  },
};

export enum Color {
  PRIMARY = 0x5e72e4,
  DANGER = 0xff4242,
  SUCCESS = 0x5bf593,
  WARNING = 0xff8d54,
  INTERMEDIATE = 0xfffa66,
}
export interface BodyguardStats {
  price: number;
  safe: number;
}