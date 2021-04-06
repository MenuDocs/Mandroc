import { Logger } from "@ayanaware/logger";
import { createConnection, Connection } from "typeorm";

import { config } from "../util/Config";

/* entities */
import { Tag } from "./entities/tag.entity";
import { Infraction } from "./entities/infraction.entity";
import { Profile } from "./entities/profile.entity";
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
        options: {
          host: config.get("redis-host"),
          port: config.get("redis-port")
        }
      },
    });

    this.log.info("Connected to MongoDB");
  }
}
