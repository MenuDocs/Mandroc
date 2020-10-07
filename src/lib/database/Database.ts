import { Connection, createConnection } from "typeorm";
import { Signale } from "signale";
import { config } from "../util/Config";
import { Profile } from "./entities/profile.entity";
import { Infraction } from "@lib";

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
      useUnifiedTopology: true,
      entities: [Profile, Infraction],
      synchronize: true
    });

    this.log.info("Connected to MongoDB");
  }
}
