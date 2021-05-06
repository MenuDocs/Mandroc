import { Database } from "../Database";

import type { Prisma, Profile } from "@prisma/client";
import type { Hook } from "./index";

type ProfileUpdate = Prisma.XOR<Prisma.ProfileUpdateInput, Prisma.ProfileUncheckedUpdateInput>;
export type ProfileHook = Hook<Profile, ProfileUpdate>;

/**
 * React-esque hooks for user profiles.
 *
 * @param userId ID of the user
 */
export async function useProfile(userId: string): Promise<ProfileHook> {
  const profile = await Database.findProfile(userId);

  const o_o = new Proxy<Profile>(profile, {
    get: (_, p: PropertyKey): any => Reflect.get(profile, p),
    has: (_, p: PropertyKey): boolean => Reflect.has(profile, p),
    set(_, __, ___): boolean {
      throw new Error("Setting a hook value is not allowed, use the caching update method instead")
    }
  });

  let updateCache: ProfileUpdate | null = null
  async function update(data?: ProfileUpdate, push: boolean = true) {
    if (push) {
      if (!data && !updateCache) {
        throw new Error("Can't update a profile with no data.")
      }

      Database.PRISMA.profile.update({
        where: { id: profile!.id },
        data: {
          ...updateCache,
          ...data
        }
      })

      return
    }

    if (!data) {
      throw new Error("Can't cache changes if no data is provided.")
    }

    updateCache = Object.assign(updateCache ?? {}, data);
  }

  return [ o_o, update ]
}
