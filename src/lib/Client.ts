import { Signale } from "signale";
import { Converter }  from "showdown";
import { Intents, MessageEmbed } from "discord.js";
import { AkairoClient, CommandHandler, ListenerHandler } from "discord-akairo";

import { Database } from "./database/Database";
import { config } from "./util/Config";
import { MandrocCommand } from "./classes/Command";
import { join } from "path";
import { Color } from "./util/constants";

export class Mandroc extends AkairoClient {
  /**
   * The database instance.
   * @type {Database}
   */
  public readonly database: Database;

  /**
   * The client logger.
   * @type {Signale}
   */
  public readonly log: Signale;

  /**
   * The commands handler.
   * @type {CommandHandler}
   */
  public readonly commandHandler: CommandHandler;

  /**
   * The listeners handler.
   * @type {ListenerHandler}
   */
  public readonly listenerHandler: ListenerHandler;

  /**
   * The turndown service.
   * @type {Converter}
   */
  public readonly showdown: Converter;

  /**
   * Whether the MDN command can be used.
   * @type {boolean}
   */
  public canMDN = true;

  /**
   * Creates a new instanceof Mandroc.
   */
  public constructor() {
    super({
      ownerID: [
        "396096412116320258",
        "191231307290771456",
        "203104843479515136",
        "424566306042544128",
      ],
      partials: ["MESSAGE", "REACTION", "CHANNEL", "GUILD_MEMBER", "USER"],
      presence: {
        activity: {
          url: "https://twitch.tv/menudocs",
          name: "!help • menudocs.org",
          type: "STREAMING",
        },
      },
      ws: {
        intents: new Intents()
          .add("GUILDS")
          .add("GUILD_MESSAGES")
          .add("GUILD_MEMBERS")
          .add("GUILD_BANS"),
      },
    });

    this.log = new Signale({ scope: "mandroc" });

    this.database = new Database();

    this.showdown = new Converter();

    this.commandHandler = new CommandHandler(this, {
      aliasReplacement: /-/g,
      allowMention: true,
      automateCategories: true,
      classToHandle: MandrocCommand,
      commandUtil: true,
      handleEdits: true,
      defaultCooldown: 7000,
      directory: join(process.cwd(), "dist", "core", "commands"),
      argumentDefaults: {
        prompt: {
          modifyStart: (_, p) =>
            new MessageEmbed()
              .setColor(Color.Warning)
              .setFooter("To cancel the prompt, send 'cancel'")
              .setDescription(p),
          modifyEnded: (_, p) =>
            new MessageEmbed()
              .setColor(Color.Warning)
              .setFooter("To cancel the prompt, send 'cancel'")
              .setDescription(p),
          modifyCancel: (_, p) =>
            new MessageEmbed().setColor(Color.Primary).setDescription(p),
          modifyRetry: (_, p) =>
            new MessageEmbed()
              .setColor(Color.Warning)
              .setFooter("To cancel the prompt, send 'cancel'")
              .setDescription(p),
          modifyTimeout: (_, p) =>
            new MessageEmbed().setColor(Color.Primary).setDescription(p),
          cancel: "Okay, I cancelled the prompt.",
          ended: "The prompt has ended.",
          timeout: "Sorry, you've ran out of time.",
          retry: "Please retry...",
          retries: 3,
          time: 15000,
        },
      },
    });

    this.listenerHandler = new ListenerHandler(this, {
      directory: join(process.cwd(), "dist", "core", "listeners"),
      automateCategories: true,
    });
  }

  public async launch(): Promise<void> {
    this.listenerHandler.setEmitters({
      client: this,
      commands: this.commandHandler,
      listeners: this.listenerHandler,
      process,
      ws: this.ws,
    });

    await this.database.launch();
    this.listenerHandler.loadAll();
    this.commandHandler.loadAll();

    await this.login(config.get("token"));
  }
}
