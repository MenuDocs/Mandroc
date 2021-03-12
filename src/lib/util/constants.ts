/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { PermissionLevel } from "../classes/Command";

import type { ImageURLOptions } from "discord.js";
import type { BodyguardTier } from "../database/entities/profile.entity";

export const IDs = {
  GUILD: "819495495511965716",
  MOD_LOGS: "819495495910293515",
  PROJECTIONS: "819495496615723035",
  VERIFICATION_MESSAGE: "819495495587987469",
  LOG_CHANNEL: "819495496615723034",
  MUTED: "819495495558496263",
  ACTION_QUEUE: "819499488477184000",
  SUGGESTIONS: "819495495910293522",
  VOICE_TEXT_CHANNEL: "819495496367210575",
  TIMEDOUT: "819499682178400306",
  LEVELS: {
    10: "819495495537262621",
    20: "819495495549583380",
    30: "819495495549583381",
    40: "819495495549583382",
    50: "819495495549583383",
    60: "819495495549583384",
    70: "819495495549583385",
    80: "819495495549583386",
    90: "819495495549583387",
    100: "819495495549583388",
  } as Record<number, string>,
  PERMISSIONS: {
    [PermissionLevel.MEMBER]: "Verified Member",
    [PermissionLevel.DONATOR]: "819500967959592981",
    [PermissionLevel.HELPER]: "819495495558496260",
    [PermissionLevel.TRIAL_MOD]: "819495495566098475",
    [PermissionLevel.MOD]: "819495495566098479",
    [PermissionLevel.ADMIN]: "819495495566098482",
    [PermissionLevel.LOWER_MANAGEMENT]: "819495495587987466",
    [PermissionLevel.MANAGEMENT]: "819495495587987467",
  } as Record<PermissionLevel, string>,
  UNVERIFIED: "819495495511965718",
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