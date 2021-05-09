import { InventoryItem, Prisma, PrismaClient, Profile, Tag } from "@prisma/client";
import { Logger } from "@ayanaware/logger";
import { config } from "../util";

export enum ToolType {
  FISHING_ROD = "fishing_rod",
  AXE = "axe",
  PICKAXE = "pickaxe",
  SHOVEL = "shovel",
}

export abstract class Database {
  /**
   * The logger instance.
   * @private
   */
  private static LOGGER = Logger.get(Database);

  /**
   * The current prisma client
   */
  static PRISMA: PrismaClient;

  /**
   * Connects to the database.
   */
  static connect() {
    const prisma = new PrismaClient({
      log: [
        {
          emit: "event",
          level: "info"
        },
        {
          emit: "event",
          level: "error"
        }
      ]
    });

    prisma.$on("info", ({ message }) => this.LOGGER.debug(message));
    prisma.$on("error", ({ message }) => this.LOGGER.error(message));

    const enabledMiddleware = config.get<Middleware[]>("database.middleware", { envType: "array" })
    if (enabledMiddleware.length) {
      Database.addMiddleware(prisma, enabledMiddleware);
    }

    Database.PRISMA = prisma;
  }

  /**
   * Adds the provided middleware to the supplied prisma client.
   *
   * @param prisma The prisma client
   * @param keys The middleware to add
   */
  static addMiddleware(prisma: PrismaClient, keys: Middleware[]) {
    for (const key of keys) {
      switch (key) {
        case "time":
          prisma.$use(async (params, next) => {
            const start = Date.now();
            const result = await next(params);
            const end = Date.now();

            Database.LOGGER.debug(`Query took ${end - start}ms`, `${params.model}.${params.action}`);
            return result;
          });

          break
      }
    }
  }

  /**
   * Finds a tool in a user's inventory.
   *
   * @param userId The ID of the User to find the tool in.
   * @param toolType The type of tool to find.
   */
  static async findTool(userId: string, toolType: ToolType): Promise<InventoryItem | null> {
    try {
      return await Database.PRISMA.inventoryItem.findFirst({
        where: {
          profileId: userId,
          item: {
            type: "Tool",
            metadata: {
              equals: {
                type: toolType
              }
            }
          }
        }
      });
    } catch (e) {
      return null;
    }
  }

  /**
   * React-esque hooks for tool items.
   *
   * @param userId The ID of the user to find the tool in.
   * @param toolType
   */
  static async useTool(userId: string, toolType: ToolType): Promise<UseInventoryItem> {
    const item = await Database.findTool(userId, toolType);
    if (!item) {
      return [ null, async () => void 0 ];
    }

    async function update(data: InventoryUpdateData) {
      await Database.PRISMA.inventoryItem.update({
        where: { id: item?.id },
        data
      });
    }

    return [ item, update ];
  }

  /**
   * Finds a tool in a user's inventory.
   *
   * @param query Name or alias of the tag,
   */
  static async findTag(query: string): Promise<Tag | null> {
    try {
      return await Database.PRISMA.tag.findFirst({
        where: {
          OR: [
            { name: query },
            { aliases: { has: query } },
            { name: { contains: query } }
          ]
        }
      });
    } catch (e) {
      return null;
    }
  }

  /**
   * Find or creates a profile with the provided id.
   *
   * @param id User id.
   */
  static async findProfile(id: string): Promise<Profile> {
    return await Database.PRISMA.profile.upsert({
      where: { id },
      create: { id },
      update: {}
    });
  }

  /**
   *
   * @returns {Promise<number>}
   */
  static async nextInfractionId(): Promise<number> {
    return (await this.PRISMA.infraction.count()) + 1;
  }
}

type InventoryUpdateData = Prisma.XOR<Prisma.InventoryItemUpdateInput, Prisma.InventoryItemUncheckedUpdateInput>
export type UseInventoryItem = Use<InventoryItem | null, InventoryUpdateData>;

type Use<T, U> = [ T, SaveMethod<U> ]
type SaveMethod<T> = (data: T) => Promise<void>;
type Middleware = "time";
