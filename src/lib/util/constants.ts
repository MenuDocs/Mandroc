import { PermissionLevel } from "../classes/Command";
import { config } from "./Config";
import { BodyguardTier } from "@prisma/client";

import type { ImageURLOptions } from "discord.js";

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
    100: config.get<string>("ids.levels.100")
  } as Record<number, string>,
  PERMISSIONS: {
    [PermissionLevel.Member]: config.get<string>("ids.permissions.member"),
    [PermissionLevel.Donor]: config.get<string>("ids.permissions.donor"),
    [PermissionLevel.Helper]: config.get<string>("ids.permissions.helper"),
    [PermissionLevel.TrialMod]: config.get<string>("ids.permissions.trial-mod"),
    [PermissionLevel.Mod]: config.get<string>("ids.permissions.mod"),
    [PermissionLevel.Admin]: config.get<string>("ids.permissions.admin"),
    [PermissionLevel.LowerManagement]: config.get<string>(
      "ids.permissions.lower-management"
    ),
    [PermissionLevel.Management]: config.get<string>(
      "ids.permissions.management"
    )
  } as Record<PermissionLevel, string>,
  UNVERIFIED: config.get<string>("ids.roles.unverified")
};

export const imageUrlOptions = {
  dynamic: true,
  size: 4096,
  format: "png"
} as ImageURLOptions;

export const bodyguardTiers: Record<BodyguardTier, BodyguardStats> = {
  [BodyguardTier.Rookie]: {
    price: 1000,
    safe: 0.31
  },
  [BodyguardTier.Gold]: {
    price: 5000,
    safe: 0.62
  },
  [BodyguardTier.Deluxe]: {
    price: 10000,
    safe: 0.73
  },
  [BodyguardTier.Chad]: {
    price: 20000,
    safe: 0.9
  }
};

export enum Color {
  Primary = 0x5e72e4,
  Danger = 0xff4242,
  Success = 0x5bf593,
  Warning = 0xff8d54,
  Intermediate = 0xfffa66
}
export interface BodyguardStats {
  price: number;
  safe: number;
}
