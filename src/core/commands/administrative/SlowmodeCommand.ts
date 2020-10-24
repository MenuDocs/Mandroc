import { adminCommand, MandrocCommand, Color } from "@lib";

import type { Message } from "discord.js";
import { MessageEmbed, TextChannel } from "discord.js";

@adminCommand("slowmode", {
  aliases: ["slowmode", "sm"],
  editable: false,
  args: [
    {
      id: "cooldown",
      type: "string",
      prompt: {
        start: "Please provide a cooldown.",
        retry: "I need a valid cooldown!.",
      },
    },
  ],
})
export default class SlowmodeCommand extends MandrocCommand {
  public async exec(message: Message, { cooldown }: args) {
    const channel = message.channel as TextChannel;
    cooldown = cooldown.toLocaleLowerCase();
    const regex = /\d+[smh]$/;

    const embed = new MessageEmbed();

    if (cooldown === "off") {
      await channel.setRateLimitPerUser(0);
      return channel.send("Disabled slowmode!");
    }

    if (!regex.exec(cooldown)) {
      embed
        .setColor(Color.Danger)
        .setDescription("You must provide a valid cooldown");

      return channel.send(embed);
    }

    embed
      .setColor(Color.Success)
      .setDescription(`Successfully set the slowmode to: \`${cooldown}\``);

    message.channel.send(embed);

    if (cooldown.includes("s")) {
      cooldown = ((+cooldown.split(/\D+/)[0] * 60) / 60).toString();
    } else if (cooldown.includes("m")) {
      cooldown = (+cooldown.split(/\D+/)[0] * 60).toString();
    } else {
      cooldown = (+cooldown.split(/\D+/)[0] * 3600).toString();
    }

    if (+cooldown > 21600) {
      embed.setColor(Color.Danger).setDescription("The max is 6 hours.");

      return message.channel.send(embed);
    }

    await channel.setRateLimitPerUser(+cooldown);
  }
}

type args = {
  cooldown: string;
};
