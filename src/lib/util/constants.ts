import { PermissionLevel } from "../classes/Command";

import type { ImageURLOptions } from "discord.js";
import type { BodyguardTier } from "../database/entities/profile.entity";
import { config } from "./Config";

export const IDs = {
  GUILD: config.get<string>("ids.guild"),
  MOD_LOGS: config.get<string>("ids.channels.mod-logs"),
  PROJECTIONS: config.get<string>("ids.channels.projections"),
  VERIFICATION_MESSAGE: config.get<string>("ids.verification-message"),
  LOG_CHANNEL: config.get<string>("ids.channels.logs"),
  MUTED: config.get<string>("ids.roles.muted"),
  ACTION_QUEUE: config.get<string>("ids.channels.actions"),
  SUGGESTIONS: config.get<string>("ids.channels.suggestions"),
  VOICE_TEXT_CHANNEL: config.get<string>("ids.channels.voice"),
  TIMED_OUT: config.get<string>("ids.roles.timed-out"),
  LEVELS: {
    10: config.get<string>("ids.levels.10"),
    20: config.get<string>("ids.levels.20"),
    30: config.get<string>("ids.levels.30"),
    40: config.get<string>("ids.levels.40"),
    50: config.get<string>("ids.levels.50"),
    60: config.get<string>("ids.levels.60"),
    70: config.get<string>("ids.levels.70"),
    80: config.get<string>("ids.levels.80"),
    90: config.get<string>("ids.levels.90"),
    100: config.get<string>("ids.levels.100"),
  } as Record<number, string>,
  PERMISSIONS: {
    [PermissionLevel.MEMBER]: config.get<string>("ids.permissions.member"),
    [PermissionLevel.DONATOR]: config.get<string>("ids.permissions.donor"),
    [PermissionLevel.HELPER]: config.get<string>("ids.permissions.helper"),
    [PermissionLevel.TRIAL_MOD]: config.get<string>("ids.permissions.trial-mod"),
    [PermissionLevel.MOD]: config.get<string>("ids.permissions.mod"),
    [PermissionLevel.ADMIN]: config.get<string>("ids.permissions.admin"),
    [PermissionLevel.LOWER_MANAGEMENT]: config.get<string>("ids.permissions.lower-management"),
    [PermissionLevel.MANAGEMENT]: config.get<string>("ids.permissions.management"),
  } as Record<PermissionLevel, string>,
  UNVERIFIED: config.get<string>("ids.roles.unverified"),
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