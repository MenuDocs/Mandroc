import { Database, Resolver } from "@lib";
import { Flag } from "discord-akairo";

import type { Message } from "discord.js";

export class ExistingTagResolver extends Resolver<string> {
  constructor() {
    super("existing-tag", {
      name: "existingTag"
    });
  }

  async exec(message: Message, phrase?: string | null): Promise<string | Flag | null> {
    if (!message.guild || !phrase) {
      return Flag.fail(phrase);
    }

    const tag = await Database.PRISMA.tag.findFirst({
      where: {
        OR: [
          { name: phrase },
          { aliases: { has: phrase } },
          { name: { contains: phrase } }
        ]
      },
      select: {
        name: true
      }
    });

    return tag ? Flag.fail(tag.name) : phrase;
  }
}
