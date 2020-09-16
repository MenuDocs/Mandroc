import { Module, ModuleOptions } from "./Module";

export class Command extends Module {
}

export enum PermissionLevel {
  Member,
  Donator,
  Helper,
  TrialMod,
  Mod,
  Admin,
  Management
}

export interface CommandDescription {
  content: string;
  examples?: string[];
  usage?: string;
}

export interface CommandOptions extends ModuleOptions {
  triggers?: string[];
  ratelimit?: string;
  description?: CommandDescription;
}
