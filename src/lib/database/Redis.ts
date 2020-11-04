/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import IORedis from "ioredis";

import type { Mandroc } from "../Client";

export class Redis {
  /**
   * The mandroc instance.
   */
  public readonly mandroc: Mandroc;

  /**
   * The IORedis instance.
   */
  public client!: IORedis.Redis;

  /**
   * @param client The mandroc instance.
   */
  public constructor(client: Mandroc) {
    this.mandroc = client;
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
      this.mandroc.log.error(e);
      return process.exit(1);
    }

    this.mandroc.log.info("Connected to redis.");
  }
}
