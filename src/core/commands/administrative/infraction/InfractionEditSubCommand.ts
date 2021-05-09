import {
  code,
  command, Database,
  Embed,
  InfractionMeta,
  Mandroc,
  MandrocCommand,
  Moderation,
  ModLog
} from "@lib";

import type { Message } from "discord.js";
import type { ArgumentOptions } from "discord-akairo";
import type { Infraction, Prisma } from "@prisma/client";

@command("infraction-edit", {
  *args(): IterableIterator<ArgumentOptions> {
    const infraction = yield {
        type: "infraction",
        prompt: {
          start: "Please provide a valid infraction id.",
          retry: "Cmon, it's not that hard to provide a valid infraction id."
        }
      },
      method = yield {
        type: [["reason", "r"]],
        prompt: {
          start: "Please give me an edit method, can be `reason`.",
          retry: "Please give me an edit method, can be `reason`."
        }
      };

    let contents: any;
    switch (method!) {
      case "reason":
        contents = yield {
          type: "string",
          match: "rest",
          prompt: {
            start: `Please provide the new reason for **Infraction #${(infraction! as Infraction).id}**`,
            retry: `Please provide the new reason for **Infraction #${(infraction! as Infraction).id}**`
          }
        };

        break;
    }

    return { infraction, method, contents };
  }
})
export class InfractionEditSubCommand extends MandrocCommand {
  async exec(msg: Message, { infraction, method, contents }: args) {
    const logChannel = await this.client.moderation.logChannel();
    switch (method) {
      case "reason":
        infraction.reason = contents;

        let message = null;
        try {
          if (infraction.messageId) {
            message = await logChannel.messages.fetch(infraction.messageId);
          }
        } catch {
          // no-op
        }

        const modlog = await ModLog.fromInfraction(
          this.client as Mandroc,
          infraction
        );

        let ml: string;
        if (message) {
          ml = message.id;
          modlog.setReason(contents);
          await message.edit(await modlog.getEmbed());
        } else {
          ml = await modlog.post();
        }

        await msg.util?.send(
          Embed.primary(
            `Edited **[#${infraction.id}](${
              Moderation.lcUrl
            }/${ml})**'s reason to be:\n${code`${contents}`}`
          )
        );
        break;
    }

    const meta = infraction.meta as InfractionMeta
    meta.edits = [
      ...(meta.edits ?? []),
      { id: msg.author.id, at: Date.now(), method, contents }
    ];


    await Database.PRISMA.infraction.update({
      where: { id: infraction.id },
      data: {
        ...infraction,
        meta: meta as Prisma.JsonObject
      }
    })
  }
}

type args = {
  infraction: Infraction;
  method: "reason";
  contents: any;
};
