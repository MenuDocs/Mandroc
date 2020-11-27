/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { Logger } from "@ayanaware/logger";
import { config } from "@lib";
import { MikroORM } from "@mikro-orm/core";

import { RedisCacheAdapter } from "./redis/RedisCacheAdapter";

export class Database {
  public readonly log = Logger.get(Database);

  /**
   * The database connection.
   */
  public connection!: MikroORM;

  /**
   * Starts the database.
   */
  public async launch() {
    this.connection = await MikroORM.init({
      type: "mongo",
      entitiesTs: [],
      clientUrl: config.get("database"),
      cache: {
        adapter: RedisCacheAdapter,
        enabled: true
      }
    })

    // this.connection = await createConnection({
    //   type: "mongodb",
    //   url: config.get<string>("database"),
    //   entities: [ Profile, Infraction, Tag ],
    //   synchronize: true,
    //   useUnifiedTopology: true,
    //   cache: {
    //     type: "ioredis",
    //     alwaysEnabled: true,
    //   },
    // });

    this.log.info("Connected to MongoDB");
  }
}
