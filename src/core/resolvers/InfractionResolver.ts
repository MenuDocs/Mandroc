import { Database, Resolver } from "@lib";

import type { Infraction } from "@prisma/client";
import type { Message } from "discord.js";

export class InfractionResolver extends Resolver<Infraction> {
  constructor() {
    super("infraction", {
      name: "infraction"
    });
  }

  async exec(
    message: Message,
    phrase?: string | null
  ): Promise<Infraction | null> {
    if (!phrase) {
      return null;
    }

    const id = this.client.commandHandler.resolver.type("number")(
      message,
      phrase
    );
    if (!id) {
      return null;
    }

    return await Database.PRISMA.infraction.findFirst({
      where: { id }
    });
  }
}
