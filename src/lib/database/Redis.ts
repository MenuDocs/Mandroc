import IORedis from "ioredis";
import { Logger } from "@ayanaware/logger";
import { config } from "../util/Config";

export class Redis {
  /**
   * The redis instance.
   * @private
   */
  private static _instance?: Redis;

  /**
   * The mandroc instance.
   */
  readonly logger = Logger.get(Redis);

  /**
   * The IORedis instance.
   */
  client!: IORedis.Redis;

  constructor() {
    if (Redis._instance) {
      return Redis._instance;
    }

    Redis._instance = this;
    Reflect.defineProperty(this, "scan", {
      value: this.scan.bind(this)
    });
  }

  static prepareObj(data: Dictionary): Dictionary<string> {
    const prepared: Dictionary<string> = {};
    for (const key of Object.keys(data)) {
      Reflect.set(prepared, key, Reflect.get(data, key).toString());
    }

    return prepared;
  }

  /**
   * Get the redis instance.
   */
  static get(): Redis {
    if (!this._instance) {
      this._instance = new Redis();
    }

    return this._instance;
  }

  /**
   * Get the total count of infractions.
   * @type {number}
   */
  async infractionCount(defaultCount = 0): Promise<number> {
    let infractions: number | string | null = await this.client.get(
      "admin:infractions"
    );
    if (!infractions) {
      infractions = defaultCount;
      await this.client.set("admin:infractions", String(defaultCount));
    }

    return +infractions;
  }

  async incrementInfractions(): Promise<number> {
    return this.client.incr("admin:infractions");
  }

  /**
   * Connects to the redis server.
   */
  async launch() {
    try {
      this.client = new IORedis({
        host: config.get<string>("redis-host"),
        port: config.get<number>("redis-port")
      });
    } catch (e) {
      this.logger.error(e);
      return process.exit(1);
    }
  }

  /**
   * Scans for keys.
   * @param pattern The key pattern.
   * @param cursor The cursor.
   * @param keys The current keys.
   */
  async scan(
    pattern: string,
    cursor: number | string = 0,
    keys: string[] = []
  ): Promise<string[]> {
    const ret = await this.client.scan(cursor, "MATCH", pattern);
    keys.push(...ret[1]);
    return ret[0] === "0" ? keys : this.scan(pattern, ret[0], keys);
  }
}
