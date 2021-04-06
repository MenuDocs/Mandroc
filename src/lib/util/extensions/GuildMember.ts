import { Structures } from "discord.js";
import { IDs, PermissionLevel, Profile } from "@lib";

class GuildMember extends Structures.get("GuildMember") {
  get permissionLevel(): PermissionLevel | null {
    for (const [level, role] of Object.entries(IDs.PERMISSIONS).reverse()) {
      if (this.roles.cache.has(role)) {
        return level as any;
      }
    }

    return this.roles.cache.has(IDs.UNVERIFIED) ? null : PermissionLevel.MEMBER;
  }

  // @ts-expect-error
  get manageable(): boolean {
    if (!this.permissionLevel) {
      return super.manageable;
    }

    return (
      super.manageable && this.permissionLevel < this.guild.me?.permissionLevel!
    );
  }

  /**
   * Determines whether this member's permission level is higher than the provided member or permission level.
   * @param {PermissionLevel | GuildMember} target The guild member or permission level.
   */
  above(target: PermissionLevel | GuildMember) {
    if (!this.permissionLevel) {
      return false;
    }

    if (target instanceof Structures.get("GuildMember")) {
      if (!target.permissionLevel) {
        return false;
      }

      return target.permissionLevel < this.permissionLevel;
    }

    return this.permissionLevel > target;
  }

  /**
   * Returns the profile for this guild member.
   */
  async getProfile(): Promise<Profile> {
    return Profile.findOneOrCreate({
      where: { userId: this.id },
      create: { userId: this.id },
    });
  }
}

Structures.extend("GuildMember", () => GuildMember);
