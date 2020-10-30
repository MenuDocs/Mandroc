import { Connection, createConnection } from "typeorm";
import { Signale } from "signale";
import { Profile, Infraction, Tag, config } from "@lib";

export class Database {
  public readonly log: Signale = new Signale({
    scope: "database",
  });

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
