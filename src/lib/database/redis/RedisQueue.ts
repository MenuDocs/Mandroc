/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import type { StringResolvable } from "discord.js";
import type { Redis } from "ioredis";

export class RedisQueue {
  /**
   * The key.
   * @private
   */
  readonly #key: string;

  /**
   * The redis instance.
   * @private
   */
  readonly #redis: Redis;

  /**
   * @param redis The redis instance.
   * @param key The key to use.
   */
  public constructor(redis: Redis, key: string) {
    this.#redis = redis;
    this.#key = key;
  }

  /**
   * Pushes a new value to the queue.
   * @param value
   * @param data
   */
  public push(
    value: StringResolvable,
    ...data: StringResolvable[]
  ): Promise<number> {
    return this.#redis.lpush(this.#key, value, ...data);
  }

  /**
   * Returns and removes the first element of the list
   *
   * @remarks
   * Works in O(1) time complexity
   */
  public pop(): Promise<string | null> {
    return this.#redis.lpop(this.#key);
  }

  /**
   * Returns the first element of the list
   */
  public peek(): Promise<string | null> {
    return this.#redis.lindex(this.#key, 0);
  }

  /**
   * Returns the last element of the list
   */
  public peekEnd(): Promise<string | null> {
    return this.#redis.lindex(this.#key, -1);
  }

  /**
   * Returns the length of this queue.
   */
  public async len(): Promise<number> {
    return this.#redis.llen(this.#key);
  }
}
