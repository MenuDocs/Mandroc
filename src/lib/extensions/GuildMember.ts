/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { Structures } from "discord.js";
import { IDS, PermissionLevel } from "@lib";

class GuildMember extends Structures.get("GuildMember") {
  public get permissionLevel(): PermissionLevel | null {
    for (const [level, role] of Object.entries(IDS.ROLES).reverse()) {
      if (this.roles.cache.has(role)) return level as any;
    }

    return this.roles.cache.has(IDS.Unverified) ? null : PermissionLevel.Member;
  }
}

Structures.extend("GuildMember", () => GuildMember);
