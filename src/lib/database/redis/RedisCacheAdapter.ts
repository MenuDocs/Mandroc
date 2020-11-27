/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import type { CacheAdapter } from "@mikro-orm/core";
import { Redis } from "./Redis";

export class RedisCacheAdapter implements CacheAdapter {
  /**
   * The redis key prefix to use.
   */
  static REDIS_PREFIX = "mikro-orm:";

  /**
   * testing cache.
   */
  _cache = new Map<string, any>();

  /**
   * Get the prefixed version of a key.
   * @param key The key to prefix.
   * @private
   */
  private static _prefix(key: string): string {
    return `${RedisCacheAdapter.REDIS_PREFIX}${key}`;
  }

  /**
   * Adds data to the mikro-orm redis cache.
   * @param key The key.
   * @param data The data.
   */
  public async set(key: string, data: any): Promise<void> {
    console.log(key, data)
    this._cache.set(key, data);
    // await Redis.get().client.set(RedisCacheAdapter._getPrefixed(key), data);
  }

  /**
   * Gets data from the redis cache.
   * @param key The redis key.
   */
  public get(key: string): Promise<any> {
    return this._cache.get(key);
    // return Redis.get().client.get(RedisCacheAdapter._getPrefixed(key));
  }

  /**
   * Clears the mikro-orm redis cache.
   */
  public async clear(): Promise<void> {
    const keys = await this._scan();
    for await (const key of keys) {
      await Redis.get().client.del(key);
    }
  }

  /**
   * Scans for mikro-orm keys.
   * @param cursor The redis cursor.
   * @param keys The keys.
   * @private
   */
  private async _scan(cursor: number | string = 0, keys: string[] = []): Promise<string[]> {
    const _keys = await Redis.get().client.scan(cursor, "MATCH", RedisCacheAdapter._prefix("*"));
    keys.push(..._keys[1]);

    if (_keys[0] === "0") {
      return keys;
    }

    return this._scan(_keys[0], keys);
  }
}

