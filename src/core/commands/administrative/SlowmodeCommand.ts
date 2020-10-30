import { adminCommand, MandrocCommand, Color } from "@lib";

import type { Message } from "discord.js";
import { MessageEmbed, TextChannel } from "discord.js";

@adminCommand("slowmode", {
  aliases: ["slowmode", "sm"],
  editable: false,
  args: [
    {
      id: "ratelimit",
      type: "lowercase",
      prompt: {
        start: "Please provide a rate-limit.",
        retry: "I need a valid rate-limit!",
      },
    },
  ],
})
export default class SlowmodeCommand extends MandrocCommand {
  public async exec(message: Message, { ratelimit }: args) {
    const channel = message.channel as TextChannel;
    const regex = /\d+[smh]$/;

    const embed = new MessageEmbed();

    if (ratelimit === "off") {
      await channel.setRateLimitPerUser(0);
      return channel.send("Disabled slowmode!");
    }

    if (!regex.exec(ratelimit)) {
      embed
        .setColor(Color.Danger)
        .setDescription("You must provide a valid cooldown");

      return channel.send(embed);
    }

    embed
      .setColor(Color.Success)
      .setDescription(`Successfully set the slowmode to: \`${ratelimit}\``);

    message.channel.send(embed);

    if (ratelimit.includes("s")) {
      ratelimit = ((+ratelimit.split(/\D+/)[0] * 60) / 60).toString();
    } else if (ratelimit.includes("m")) {
      ratelimit = (+ratelimit.split(/\D+/)[0] * 60).toString();
    } else {
      ratelimit = (+ratelimit.split(/\D+/)[0] * 3600).toString();
    }

    if (+ratelimit > 21600) {
      embed.setColor(Color.Danger).setDescription("The max is 6 hours.");

      return message.channel.send(embed);
    }

    await channel.setRateLimitPerUser(+ratelimit);
  }
}

type args = {
  ratelimit: string;
};
