/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import IORedis from "ioredis";
import { Logger } from "@ayanaware/logger";

export class Redis {
  /**
   * The redis instance.
   * @private
   */
  private static _instance?: Redis;

  /**
   * The mandroc instance.
   */
  public readonly logger = Logger.get(Redis);

  /**
   * The IORedis instance.
   */
  public client!: IORedis.Redis;

  constructor() {
    Redis._instance = this;
  }

  /**
   * Get the redis instance.
   */
  public static get(): Redis {
    if (!this._instance) {
      this._instance = new Redis();
    }

    return this._instance;
  }

  /**
   * Get the total count of infractions.
   * @type {number}
   */
  public async infractionCount(defaultCount = 0): Promise<number> {
    let infractions: number | string | null = await this.client.get(
        "admin:infractions"
    );
    if (!infractions) {
      infractions = defaultCount;
      await this.client.set("admin:infractions", String(defaultCount));
    }

    return +infractions;
  }

  public async incrementInfractions(): Promise<number> {
    return this.client.incr("admin:infractions");
  }

  /**
   * Connects to the redis server.
   */
  public async launch() {
    try {
      this.client = new IORedis();
    } catch (e) {
      this.logger.error(e);
      return process.exit(1);
    }
  }
}
