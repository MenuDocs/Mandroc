import { command, Database, Embed, MandrocCommand } from "@lib";
import type { Infraction } from "@prisma/client";
import type { GuildMember, Message } from "discord.js";

@command("pardon", {
  aliases: [ "pardon" ],
  description: {
    content: "Removes a warn from a provided user",
    examples: (prefix: string) => [ `${prefix}pardon @2D 7` ],
    usage: "<member> <case id>"
  },
  args: [
    {
      id: "member",
      type: "member",
      prompt: {
        start: "Please provide a member to pardon",
        retry: "I don't think you quite get how this works..."
      }
    },
    {
      id: "infraction",
      type: "infraction",
      prompt: {
        start: "Please provide a valid case id",
        retry: "Provide a valid case id."
      }
    },
    {
      id: "reason",
      type: "reason",
      match: "rest",
      prompt: {
        start: "Please provide a valid reason",
        retry: "Provide a valid reason."
      }
    }
  ]
})
export class PardonCommand extends MandrocCommand {
  async exec(message: Message, {
    member,
    infraction,
    reason
  }: args) {
    if (infraction.type !== "Warn") {
      const embed = Embed.warning("The provided case isn't for a warning.");
      return message.util?.send(embed);
    }

    if (infraction.offenderId !== member.id) {
      const embed = Embed.danger(`${member} isn't the offender for **Case ${infraction.id}**.`);
      return message.util?.send(embed);
    }

    await Database.PRISMA.infraction.update({
      where: { id: infraction.id },
      data: {
        meta: {
          pardon: reason
        }
      }
    });

    const embed = Embed.success(`Successfully pardoned ${member}.`);
    return message.util?.send(embed);
  }
}

type args = {
  member: GuildMember;
  infraction: Infraction;
  reason: string;
}
