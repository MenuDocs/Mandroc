import { Database, HookSave } from "@lib";

import type { Prisma, Tag } from "@prisma/client";
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
    return [ null, async () => void 0 ];
  }

  const o_o = new Proxy<Tag>(tag, {
    get: (_, p: PropertyKey): any => Reflect.get(tag, p),
    has: (_, p: PropertyKey): boolean => Reflect.has(tag, p),
    set(_, __, ___): boolean {
      throw new Error("Setting a hook value is not allowed, use the caching update method instead");
    }
  });

  return [ o_o, cachedTagUpdate(tag?.id!!) ];
}

/**
 *
 */
export function cachedTagUpdate(id: string): HookSave<TagUpdate> {
  let updateCache: TagUpdate | null = null;

  return async function update(data?: TagUpdate, push: boolean = true) {
    if (push) {
      if (!data && !updateCache) {
        throw new Error("Can't update a tag with no data.");
      }

      await updateTag(id, {
        ...updateCache,
        ...data
      });

      return;
    }

    if (!data) {
      throw new Error("Can't cache changes if no data is provided.");
    }

    updateCache = Object.assign(updateCache ?? {}, data);
  }
}

/**
 * Updates a tag with the provided id and data.
 *
 * @param id Tag ID
 * @param data Data to update the found tag with.
 */
export async function updateTag(id: string, data: TagUpdate) {
  await Database.PRISMA.tag.update({
    where: { id },
    data
  });
}

