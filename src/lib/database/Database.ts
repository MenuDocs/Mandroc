import { InventoryItem, Prisma, PrismaClient, Profile } from "@prisma/client";
import { Logger } from "@ayanaware/logger";

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

    Database.PRISMA = prisma;
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
   * React-esque hooks for user profiles.
   *
   * @param userId ID of the user
   */
  static async useProfile(userId: string): Promise<UseProfile> {
    const profile = await this.findProfile(userId);

    async function update(data: ProfileUpdateData) {
      await Database.PRISMA.profile.update({
        where: { id: userId },
        data
      });
    }

    return [ profile, update ];
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

type ProfileUpdateData = Prisma.XOR<Prisma.ProfileUpdateInput, Prisma.ProfileUncheckedUpdateInput>
export type UseProfile = Use<Profile, ProfileUpdateData>;

type Use<T, U> = [ T, SaveMethod<U> ]
type SaveMethod<T> = (data: T) => Promise<void>;
