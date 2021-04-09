import { Guild, Intents, MessageEmbed, Util } from "discord.js";
import { Logger } from "@ayanaware/logger";
import {
  AkairoClient,
  CommandHandler,
  Flag,
  InhibitorHandler,
  ListenerHandler
} from "discord-akairo";
import { join } from "path";
import TurndownService from "turndown";
import ms from "ms";

import { ResolverHandler } from "./classes/resolver/ResolverHandler";
import { MonitorHandler } from "./classes/monitor/MonitorHandler";

import { Database, Redis, Tag } from "./database";
import { Scheduler } from "./scheduler/Scheduler";
import { MandrocCommand } from "./classes/Command";
import { Moderation } from "./administrative/Moderation";
import { Color, config, IDs } from "./util";

export class Mandroc extends AkairoClient {
  /**
   * The database instance.
   */
  readonly database: Database;

  /**
   * The client logger.
   */
  readonly log: Logger;

  /**
   * The resolver handler.
   */
  readonly resolverHandler: ResolverHandler;

  /**
   * The monitor handler.
   */
  readonly monitorHandler: MonitorHandler;

  /**
   * The commands handler.
   */
  readonly commandHandler: CommandHandler;

  /**
   * The inhibitor handler.
   */
  readonly inhibitorHandler: InhibitorHandler;

  /**
   * The listeners handler.
   */
  readonly listenerHandler: ListenerHandler;

  /**
   * The turndown service.
   */
  readonly turndown: TurndownService;

  /**
   * The redis utility.
   */
  readonly redis: Redis;

  /**
   * The moderation instance.
   */
  readonly moderation: Moderation;

  /**
   * Whether the MDN command can be used.
   */
  canMDN = true;

  /**
   * Creates a new instanceof Mandroc.
   */
  constructor() {
    super({
      ownerID: [
        "396096412116320258",
        "191231307290771456",
        "203104843479515136",
        "424566306042544128",
        "277211104390807552"
      ],
      partials: ["MESSAGE", "REACTION", "CHANNEL", "GUILD_MEMBER", "USER"],
      presence: {
        activity: {
          url: "https://twitch.tv/menudocs",
          name: "!help • menudocs.org",
          type: "STREAMING"
        }
      },
      fetchAllMembers: true,
      ws: {
        intents: new Intents()
          .add("GUILDS")
          .add("GUILD_MESSAGES")
          .add("GUILD_MEMBERS")
          .add("GUILD_BANS")
          .add("GUILD_MESSAGE_REACTIONS")
          .add("DIRECT_MESSAGES")
          .add("GUILD_VOICE_STATES")
      }
    });

    this.log = Logger.get(Mandroc);

    this.database = new Database();

    this.redis = new Redis();

    this.moderation = new Moderation(this);

    new Scheduler(this);

    this.turndown = new TurndownService().addRule("hyperlink", {
      filter: "a",
      replacement: (text, node) =>
        `[${text}](https://developer.mozilla.org${node.href})`
    });

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
          retries: 3,
          time: 15000
        }
      }
    });

    this.resolverHandler = new ResolverHandler(this, {
      directory: join(process.cwd(), "dist", "core", "resolvers")
    });

    this.monitorHandler = new MonitorHandler(this, {
      directory: join(process.cwd(), "dist", "core", "monitors")
    });

    this.listenerHandler = new ListenerHandler(this, {
      directory: join(process.cwd(), "dist", "core", "listeners"),
      automateCategories: true
    });

    this.inhibitorHandler = new InhibitorHandler(this, {
      directory: join(process.cwd(), "dist", "core", "inhibitors"),
      automateCategories: true
    });

    this.commandHandler.resolver.addType("tag", async (message, phrase) => {
      if (!message.guild) {
        return Flag.fail(phrase);
      }
      if (!phrase) {
        return Flag.fail(phrase);
      }
      phrase = Util.cleanContent(phrase.toLowerCase(), message);

      let tags = await Tag.find();
      const [tag] = tags.filter(
        t => t.name === phrase || t.aliases.includes(phrase)
      );

      return tag || null;
    });

    this.commandHandler.resolver.addType("duration", (_m, phrase) => {
      if (!phrase) {
        return null;
      }

      const _ms = ms(phrase);
      return !_ms ? null : _ms;
    });

    this.commandHandler.resolver.addType(
      "existingTag",
      async (message, phrase) => {
        if (!message.guild) {
          return Flag.fail(phrase);
        }
        if (!phrase) {
          return Flag.fail(phrase);
        }

        const phraseArr = phrase.split(",");
        phraseArr.forEach(s =>
          Util.cleanContent(s.trim().toLowerCase(), message)
        );

        let tags = await Tag.find();
        const [tag] = tags.filter(
          t => t.name === phrase || t.aliases.includes(phrase)
        );

        return tag ? Flag.fail(tag.name) : phrase;
      }
    );
  }

  /**
   * The guild to use.
   */
  get guild(): Guild {
    return this.guilds.cache.get(IDs.GUILD)!;
  }

  async launch(): Promise<void> {
    this.listenerHandler.setEmitters({
      client: this,
      commands: this.commandHandler,
      listeners: this.listenerHandler,
      process,
      ws: this.ws
    });

    this.commandHandler
      .useInhibitorHandler(this.inhibitorHandler)
      .useListenerHandler(this.listenerHandler);

    await this.database.launch();
    await this.redis.launch();

    await this.monitorHandler.loadAll();
    await this.resolverHandler.loadAll();
    await this.listenerHandler.loadAll();
    await this.commandHandler.loadAll();
    await this.inhibitorHandler.loadAll();

    await this.login(config.get<string>("discord-token"));
  }
}
