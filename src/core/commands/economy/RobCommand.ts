import {
  command,
  MandrocCommand,
  Embed,
  bodyguardTiers,
  BodyguardTier,
} from "@lib";
import ms from "ms";

import type { GuildMember, Message } from "discord.js";

const failureMessages: Record<
  BodyguardTier,
  (target: GuildMember) => string
> = {
  chad: (g) =>
    `NANI!?!?! **${g.user.tag}** had a **Chad** tier bodyguard <:monkaMEGA:515436779893948416>`,
  deluxe: (g) =>
    `Ohk... so **${g.user.tag}** had a good bodyguard. Better luck next time.`,
  gold: (g) => `Wow. You failed to rob **${g.user.tag}**`,
  rookie: (g) => `Lol. You really failed to rob **${g.user.tag}**...`,
};

@command("rob", {
  aliases: ["rob", "steal"],
  channel: "guild",
  description: {
    content: "Robs money from a user.",
    examples: (prefix: string) => [
      `${prefix}rob @R1zeN#0001`,
      `${prefix}rob @duncte123#1245`,
      `${prefix}rob T3NED#0001`,
    ],
    usage: "<user>",
  },
  args: [
    {
      id: "victim",
      type: "member",
      prompt: {
        start: "Please give me a user to rob.",
        retry: "Please provide a user ... Example: `!rob @R1zeN#0001`",
      },
    },
  ],
})
export default class RobCommand extends MandrocCommand {
  async exec(message: Message, { victim: member }: args) {
    const robber = await message.member?.getProfile()!,
      victim = await member.getProfile();

    if (victim.pocket < 200) {
      const embed = Embed.Warning("They do not have enough money to be robbed.");
      return message.channel.send(embed);
    }

    if (robber.lastRobbed && robber.lastRobbed + ms("2h") > Date.now()) {
      const embed = Embed.Warning("You can only rob once every two hours!");
      return message.channel.send(embed);
    }

    const rob = async (bodyguard = false) => {
      const stolen = Math.floor((Math.random() * victim.pocket) / (bodyguard ? 8 : 9));

      victim.pocket -= stolen;
      robber.pocket += stolen;
      robber.lastRobbed = Date.now();

      const embed = Embed.Primary(`You stole **${stolen} ₪** from ${member}.${bodyguard ? "" : "\nThey should really get a bodyguard :eyes:"}`);

      await message.util?.send(embed);
      await Promise.all([victim, robber].map((p) => p.save()));
    };

    if (!victim.bodyguard) {
      return rob();
    }

    const rand = Math.random();
    if (rand < bodyguardTiers[victim.bodyguard].safe) {
      const embed = Embed.Primary(failureMessages[victim.bodyguard](member));
      return message.util?.send(embed);
    }

    return rob(true);
  }
}

type args = {
  victim: GuildMember;
};
