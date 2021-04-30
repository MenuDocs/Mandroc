import { Database, Resolver } from "@lib";
import { Flag } from "discord-akairo";

import type { Tag } from "@prisma/client";
import type { Message } from "discord.js";

export class TagResolver extends Resolver<Tag> {
  constructor() {
    super("tag", {
      name: "tag"
    });
  }

  async exec(message: Message, phrase?: string | null): Promise<Tag | Flag | null> {
    if (!message.guild || !phrase) {
      return Flag.fail(phrase);
    }

    return await Database.PRISMA.tag.findFirst({
      where: {
        name: phrase,
        OR: {
          aliases: {
            has: phrase
          }
        }
      }
    });
  }
}
