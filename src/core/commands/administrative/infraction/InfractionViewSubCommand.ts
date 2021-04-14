import {
  command,
  Embed,
  Infraction,
  MandrocCommand,
  Moderation,
  ModLog
} from "@lib";

import type { Message } from "discord.js";
import moment from "moment";
import ms from "ms";

@command("infraction-view", {
  args: [
    {
      id: "infraction",
      type: "infraction",
      prompt: {
        start: "Please provide a valid infraction id.",
        retry: "Please provide a valid infraction id."
      }
    }
  ]
})
export class InfractionViewSubCommand extends MandrocCommand {
  async exec(message: Message, { infraction }: args) {
    const offender = await this.client.users.fetch(infraction.offenderId, true),
      moderator = await this.client.users.fetch(infraction.moderatorId, true);

    const embed = Embed.Primary()
      .setTitle(`${infraction.type.capitalize()} (Case ${infraction.id})`)
      .setDescription(
        [
          `**Created At:** ${moment(infraction.createdAt).format("L LT")}`,
          `**Moderator:** ${moderator.tag} \`(${moderator.id})\``,
          `**Offender:** ${offender.tag} \`(${offender.id})\``,
          infraction.meta.duration
            ? `**Duration:** ${ms(infraction.meta.duration, { long: true })}`
            : false,
          `**Reason:** ${await ModLog.parseReason(infraction.reason)}`
        ].filter(Boolean)
      );

    if (infraction.meta.edits) {
      embed.addField(
        "❯ Edits",
        infraction.meta.edits
          .map(
            (e: Dictionary) =>
              `<@${e.id}> edited the \`${e.method}\` at **${moment(e.at).format(
                "L LT"
              )}**`
          )
          .join("\n")
      );
    }

    if (infraction.messageId) {
      embed.setURL(`${Moderation.lcurl}/${infraction.messageId}`);
    }

    await message.util?.send(embed);
  }
}

type args = {
  infraction: Infraction;
};
