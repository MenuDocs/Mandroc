/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { Logger } from "@ayanaware/logger";
import { config } from "@lib";
import { createConnection, Connection } from "typeorm";

import { Infraction } from "./entities/infraction.entity";
import { Profile } from "./entities/profile.entity";
import { Tag } from "./entities/tag.entity";

export class Database {
  public readonly log = Logger.get(Database);

  /**
   * The database connection.
   */
  public connection!: Connection;

  /**
   * Starts the database.
   */
  public async launch() {
    this.connection = await createConnection({
      type: "mongodb",
      url: config.get<string>("database"),
      entities: [Profile, Infraction, Tag],
      synchronize: true,
      useUnifiedTopology: true,
      cache: {
        type: "ioredis",
        alwaysEnabled: true,
      },
    });

    this.log.info("Connected to MongoDB");
  }
}
