import { PrismaClient } from "@prisma/client";
import { Logger } from "@ayanaware/logger";

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
   * Find or creates a profile with the provided id.
   *
   * @param id User id.
   */
  static async findProfile(id: string): Promise<any> {
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
