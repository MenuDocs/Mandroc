/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { Collection } from "discord.js";
import { EventEmitter } from "events";

import type { Redis } from "ioredis";
import type { Mandroc } from "../Client";

const KEY = "scheduler:tasks";
const TASK = (name: string) => `scheduler:${name}`;

export class Scheduler extends EventEmitter {
  /**
   * The check interval.
   * @private
   */
  //#interval?: NodeJS.Timeout;

  /**
   * All scheduled/synced tasks.
   * @private
   */
  readonly #tasks: Collection<string, ScheduledTask>;

  /**
   * The client instance.
   * @private
   */
  readonly #client: Mandroc;

  /**
   * @param client The client instance.
   */
  public constructor(client: Mandroc) {
    super();

    this.#client = client;
    this.#tasks = new Collection();
  }

  /**
   * The tasks to get.
   */
  public get tasks(): Collection<string, ScheduledTask> {
    return this.#tasks;
  }

  /**
   * The redis client.
   * @private
   */
  private get redis(): Redis {
    return this.#client.redis.client;
  }

  /**
   * Syncs all current tasks.
   */
  public async sync(): Promise<this> {
    const tasks = (await this.redis.smembers(KEY)) ?? [];
    for (const name of tasks) {
      const task = await this.redis.get(TASK(name));
      if (!task) continue;
      this.#tasks.set(name, JSON.parse(task));
    }

    return this;
  }

  /**
   * Creates a new task.
   * @param name The name of the task.
   * @param data The data to set.
   */
  public async new(
    name: string,
    data: Dictionary & { endAt: number }
  ): Promise<this> {
    this.#tasks.set(name, data);

    await this.redis.sadd(KEY, name);
    await this.redis.set(TASK(name), JSON.stringify(data));

    return this;
  }

  /**
   * Deletes a task.
   * @param name The name of the task to delete.
   * @param sync Whether to sync the tasks.
   */
  public async delete(name: string, sync = true): Promise<this> {
    if (sync) await this.sync();

    const deleted = this.#tasks.delete(name);
    if (deleted) {
      await this.redis.srem(KEY, name);
      await this.redis.del(TASK(name));
    }

    return this;
  }

  /**
   * Checks for tasks that have ended.
   */
  public async check() {
    const now = Date.now();
    for (const [name, data] of this.#tasks) {
      if (data.endAt > now) continue;

      await this.delete(name);
    }
  }

  _clearInterval() {}
}

interface ScheduledTask extends Dictionary {
  endAt: number;
}
