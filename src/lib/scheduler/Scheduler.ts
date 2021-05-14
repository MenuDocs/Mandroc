import { Collection } from "discord.js";
import { randomBytes } from "crypto";
import { Redis } from "../database/Redis";

import { UnbanMeta, UnbanTask } from "./tasks/UnbanTask";
import { UnmuteMeta, UnmuteTask } from "./tasks/UnmuteTask";
import { BoostersMeta, BoostersTask } from "./tasks/BoostersTask";
import { GiveawayMeta, GiveawayTask } from "./tasks/GiveawayTask";

import type { Mandroc } from "../Client";
import type { ScheduledTask, ScheduledTaskInfo } from "./tasks/ScheduledTask";

export const TASK = (task: string, id: string) => `tasks:${task}.${id}`;
export const META = (task: string, id: string) => `tasks-meta:${task}.${id}`;

export class Scheduler {
  private static _instance: Scheduler | undefined;

  /**
   * The client instance.
   */
  readonly client: Mandroc;

  /**
   * All tasks.
   */
  readonly tasks: Collection<string, ScheduledTask<any>>;

  /**
   * @param client The mandroc client.
   */
  constructor(client: Mandroc) {
    if (Scheduler._instance) {
      throw new Error("This class should not be instantiated more than once.");
    }

    this.client = client;
    this.tasks = new Collection();
    for (const task of [
      new UnbanTask(),
      new UnmuteTask(),
      new BoostersTask(),
      new GiveawayTask()
    ]) {
      this.tasks.set(task.name, task);
    }

    Scheduler._instance = this;
  }

  /**
   * Generates a Random ID.
   */
  static generateRandomId(): string {
    return randomBytes(6).toString("base64");
  }

  /**
   * Get's the Scheduler instance.
   */
  static get(): Scheduler {
    if (!this._instance) {
      throw new Error("Please only instantiate the Scheduler once.");
    }

    return this._instance;
  }

  /**
   * Parses a redis key.
   * @param key The redis key to parse.
   */
  static parse(
    key: string
  ): { meta: boolean; id: string; task: string } | null {
    const regex = /^tasks(-meta)?:(\w+)\.(.*)$/im;
    if (!regex.test(key)) {
      return null;
    }

    const [, meta, task, id] = regex.exec(key)!;

    return {
      meta: !!meta,
      task,
      id
    };
  }

  /**
   * The redis wrapper.
   */
  static get redis(): Redis {
    return Redis.get();
  }

  static async getMetadata<T>(key: string): Promise<T> {
    return (await Scheduler.redis.client.hgetall(key)) as unknown as T
  }

  /**
   * Schedules a task to be ran at a specific date.
   * @param task The task to schedule.
   * @param runAt The end timestamp.
   * @param id
   * @param meta Any metadata to supply.
   */
  async schedule<K extends keyof MetaMap, M extends MetaMap[K]>(
    task: K,
    runAt: number,
    id: string = Scheduler.generateRandomId(),
    meta: M = {} as M
  ): Promise<string> {
    if (!this.tasks.has(task)) {
      throw new TypeError(`The task "${task}" doesn't exist.`);
    }

    if (runAt < Date.now()) {
      throw new RangeError("The provided date is not greater than now.");
    }

    let metaKey;
    if (meta && Object.keys(meta).length > 0) {
      metaKey = META(task, id);
      await Scheduler.redis.client.hset(metaKey, meta as Dictionary);
    }

    await Scheduler.redis.client.hset(TASK(task, id), {
      metaKey: metaKey ?? "",
      runAt
    });

    return id;
  }

  /**
   * Initializes the Scheduler.
   */
  async init() {
    await this._check();
    this.client.setInterval(() => this._check(), 10 * 1000);
  }

  async cleanup(task: string, id: string) {
    await Scheduler.redis.client.del(TASK(task, id), META(task, id));
  }

  async _runKey(key: string, data: ScheduledTaskInfo) {
    const meta = data.metaKey
      ? await Scheduler.getMetadata(data.metaKey)
      : {}

    await this.tasks
      .get(Scheduler.parse(key)!.task)
      ?.execute(this.client, meta, data);

    await Scheduler.redis.client.del(
      ...(data.metaKey ? [data.metaKey, key] : [key])
    );
  }

  /**
   * Checks a redis key.
   *
   * @param key The redis key.
   */
  async _checkKey(key: string) {
    const data: ScheduledTaskInfo = (await Scheduler.redis.client.hgetall(
      key
    )) as any;
    if (+data.runAt <= Date.now()) {
      await this._runKey(key, data);
    }
  }

  /**
   * Iterates through every active task and checks whether their run date has been passed.
   */
  private async _check() {
    const scheduled = await Scheduler.redis.scan("tasks:*");
    for (const key of scheduled) {
      await this._checkKey(key);
    }
  }
}

type MetaMap = {
  giveaway: GiveawayMeta;
  unban: UnbanMeta;
  unmute: UnmuteMeta;
  boosters: BoostersMeta;
};
