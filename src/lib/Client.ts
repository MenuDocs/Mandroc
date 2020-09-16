import { Signale } from "signale";
import { Client, Intents } from "discord.js";
import { Database } from "./database/Database";
import { config } from "./util/Config";

export class Mandroc extends Client {
  /**
   * The database instance.
   */
  public readonly database: Database;

  /**
   * The client logger.
   */
  public readonly log: Signale;

  /**
   * Creates a new instanceof Mandroc.
   */
  public constructor() {
    super({
      partials: [ "MESSAGE", "REACTION" ],
      presence: {
        activity: {
          url: "https://twitch.tv/menudocs",
          name: "!help • menudocs.org",
          type: "STREAMING"
        }
      },
      ws: {
        intents: new Intents()
          .add("GUILDS")
          .add("GUILD_MESSAGES")
          .add("GUILD_MEMBERS")
          .add("GUILD_BANS")
      }
    });

    this.log = new Signale({ scope: "mandroc" });
    this.database = new Database();
  }

  public async launch(): Promise<void> {
    this.on("ready", () => this.log.info("Ready!"));
    await this.database.launch();
    await this.login(config.get("token"));
  }
}