import { /* Color, */ command, MandrocCommand /*, Profile */ } from "@lib";
import type { Message, User } from "discord.js";
//import { MessageEmbed } from "discord.js";

@command("rob", {
  aliases: ["rob", "steal"],
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
      id: "toRob",
      type: "user",
      prompt: {
        start: "Please give me a user to rob.",
        retry: "Please provide a user ... Example: `!rob @R1zeN#0001`",
      },
    },
  ],
})
export default class RobCommand extends MandrocCommand {
  async exec(_message: Message, {}: args) {
    /*const robberProfile =
      (await Profile.findOne({ _id: message.author.id })) ??
      (await Profile.create({ _id: message.author.id }));
    const toRobProfile =
      (await Profile.findOne({ _id: toRob.id })) ??
      (await Profile.create({ _id: toRob.id }));
    const date = new Date();

    const embed = new MessageEmbed();

    if (toRobProfile.pocket < 200) {
      embed
        .setColor(Color.Warning)
        .setDescription("They do not have enough money to be robbed.");

      return message.channel.send(embed);
    }

    // 31:10:2020:23.01
    if (robberProfile.lastRobbedDateString) {
      const lastRobbedHours = robberProfile.lastRobbedDateString.split(":")[3];

      if (date.getHours() - +lastRobbedHours < 2) {
        embed
          .setColor(Color.Warning)
          .setDescription("You can only rob once every two hours!");

        return message.channel.send(embed);
      }
    }

    let robChancePercentage = 70;

    if (toRobProfile.bodyguard === "rookie") robChancePercentage = 55;

    if (toRobProfile.bodyguard === "gold") robChancePercentage = 40;

    if (toRobProfile.bodyguard === "deluxe") robChancePercentage = 35;

    if (toRobProfile.bodyguard === "chad") robChancePercentage = 25;

    const answer = Math.floor(Math.random() * 100);

    if (answer < robChancePercentage) {
      const robbedFor = Math.floor((Math.random() * toRobProfile.pocket) / 9);

      robberProfile.pocket += robbedFor;
      toRobProfile.pocket -= robbedFor;

      toRobProfile.save();

      embed
        .setColor(Color.Success)
        .setDescription(`You successfully robbed ${toRob} for ${robbedFor}`);

      message.channel.send(embed);
    } else {
      embed.setColor(Color.Warning).setDescription("You failed to rob them.");

      message.channel.send(embed);
    }

    robberProfile.lastRobbedDateString = `${date.getDate()}:${date.getMonth()}:${date.getFullYear()}:${date.getHours()}:${date.getMinutes()}`;
    robberProfile.save();*/
  }
}

type args = {
  toRob: User;
};
