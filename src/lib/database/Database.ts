/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { Logger } from "@ayanaware/logger";
import { createConnection, Connection } from "typeorm";

import { Infraction, Profile, Tag, config } from "@lib";
import { ReactionRole } from "./entities/reaction-role.entity";

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
      url: config.get<string>("database-uri"),
      entities: [Profile, Infraction, Tag, ReactionRole],
      synchronize: true,
      useUnifiedTopology: true,
      cache: {
        type: "ioredis",
        duration: 30000,
        alwaysEnabled: true,
      },
    });

    this.log.info("Connected to MongoDB");
  }
}
