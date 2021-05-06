import { Database } from "@lib";

import type { Tag, Prisma } from "@prisma/client";
import type { Hook } from "./index";

type TagUpdate = Prisma.XOR<Prisma.TagUpdateInput, Prisma.TagUncheckedUpdateInput>;
export type TagHook = Hook<Tag | null, TagUpdate>;

/**
 * React-esque hooks for tags.
 *
 * @param query Name or alias of the tag.
 */
export async function useTag(query: string): Promise<TagHook> {
  const tag = await Database.findTag(query);
  if (!tag) {
    return [ null , async () => void 0 ]
  }

  const o_o = new Proxy<Tag>(tag, {
    get: (_, p: PropertyKey): any => Reflect.get(tag, p),
    has: (_, p: PropertyKey): boolean => Reflect.has(tag, p),
    set(_, __, ___): boolean {
      throw new Error("Setting a hook value is not allowed, use the caching update method instead")
    }
  });

  let updateCache: TagUpdate | null = null
  async function update(data?: TagUpdate, push: boolean = true) {
    if (push) {
      if (!data && !updateCache) {
        throw new Error("Can't update a tag with no data.")
      }

      Database.PRISMA.tag.update({
        where: { id: tag!.id },
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


