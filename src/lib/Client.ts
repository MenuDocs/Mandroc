/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { Intents, MessageEmbed, Util } from "discord.js";
import {
  AkairoClient,
  CommandHandler,
  Flag,
  InhibitorHandler,
  ListenerHandler,
} from "discord-akairo";
import TurndownService from "turndown";

import { Database } from "./database/Database";
import { config } from "./util/Config";
import { MandrocCommand } from "./classes/Command";
import { join } from "path";
import { Color } from "./util/constants";
import { Redis } from "./database/redis/Redis";
import { Moderation } from "./adminstrative/Moderation";
import { Scheduler } from "./classes/Scheduler";
import { Tag } from "./database/entities/tag.entity";
import { Logger } from "@ayanaware/logger";

export class Mandroc extends AkairoClient {
  /**
   * The database instance.
   */
  public readonly database: Database;

  /**
   * The client logger.
   */
  public readonly log: Logger;

  /**
   * The scheduler.
   */
  public readonly scheduler: Scheduler;

  /**
   * The commands handler.
   */
  public readonly commandHandler: CommandHandler;

  /**
   * The inhibitor handler.
   */
  public readonly inhibitorHandler: InhibitorHandler;

  /**
   * The listeners handler.
   */
  public readonly listenerHandler: ListenerHandler;

  /**
   * The turndown service.
   */
  public readonly turndown: TurndownService;

  /**
   * The redis util.
   */
  public readonly redis: Redis;

  /**
   * The moderation instance.
   */
  public readonly moderation: Moderation;

  /**
   * Whether the MDN command can be used.
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
        "277211104390807552",
      ],
      partials: ["MESSAGE", "REACTION", "CHANNEL", "GUILD_MEMBER", "USER"],
      presence: {
        activity: {
          url: "https://twitch.tv/menudocs",
          name: "!help • menudocs.org",
          type: "STREAMING",
        },
      },
      fetchAllMembers: true,
      ws: {
        intents: new Intents()
          .add("GUILDS")
          .add("GUILD_MESSAGES")
          .add("GUILD_MEMBERS")
          .add("GUILD_BANS"),
      },
    });

    this.log = Logger.get(Mandroc);

    this.database = new Database();

    this.scheduler = new Scheduler(this);

    this.redis = new Redis(this);

    this.moderation = new Moderation(this);

    this.turndown = new TurndownService().addRule("hyperlink", {
      filter: "a",
      replacement: (text, node) =>
        `[${text}](https://developer.mozilla.org${node.href})`,
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
          time: 15000,
        },
      },
    });

    this.listenerHandler = new ListenerHandler(this, {
      directory: join(process.cwd(), "dist", "core", "listeners"),
      automateCategories: true,
    });

    this.inhibitorHandler = new InhibitorHandler(this, {
      directory: join(process.cwd(), "dist", "core", "inhibitors"),
      automateCategories: true,
    });

    this.commandHandler.resolver.addType("tag", async (message, phrase) => {
      if (!message.guild) return Flag.fail(phrase);
      if (!phrase) return Flag.fail(phrase);
      phrase = Util.cleanContent(phrase.toLowerCase(), message);

      let tags = await Tag.find();
      const [tag] = tags.filter(
        (t) => t.name === phrase || t.aliases.includes(phrase)
      );

      return tag || Flag.fail(phrase);
    });

    this.commandHandler.resolver.addType(
      "existingTag",
      async (message, phrase) => {
        if (!message.guild) return Flag.fail(phrase);
        if (!phrase) return Flag.fail(phrase);

        const phraseArr = phrase.split(",");
        phraseArr.forEach((s) =>
          Util.cleanContent(s.trim().toLowerCase(), message)
        );

        let tags = await Tag.find();
        const [tag] = tags.filter(
          (t) => t.name === phrase || t.aliases.includes(phrase)
        );

        return tag ? Flag.fail(tag.name) : phrase;
      }
    );
  }

  public async launch(): Promise<void> {
    this.listenerHandler.setEmitters({
      client: this,
      commands: this.commandHandler,
      listeners: this.listenerHandler,
      process,
      ws: this.ws,
    });

    this.commandHandler
      .useInhibitorHandler(this.inhibitorHandler)
      .useListenerHandler(this.listenerHandler);

    await this.database.launch();
    await this.redis.launch();

    this.listenerHandler.loadAll();
    this.commandHandler.loadAll();
    this.inhibitorHandler.loadAll();

    await this.login(config.get("token"));
  }
}
