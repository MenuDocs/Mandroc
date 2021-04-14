import { Color, command, MandrocCommand } from "@lib";
import { Message, MessageEmbed } from "discord.js";

@command("shop", {
  aliases: ["shop", "store", "buy"],
  description: {
    content: "Opens the shop.",
    examples: (prefix: string) => [`${prefix}shop`]
  }
})
export default class ShopCommand extends MandrocCommand {
  public async exec(message: Message) {
    const embed = new MessageEmbed()
      .setTitle("Shop")
      .setColor(Color.Primary)
      .setDescription([
        "*Type any of the following numbers to view the category ...*",
        "**1. Bodyguards**",
        "**2. Boosters**",
        "**3. Other**"
      ])
      .setFooter("Cancel at any time to writing `cancel` in the chat");

    const toEdit = await message.channel.send(embed);

    const embedDescs = [
      // default
      [
        "*Type any of the following numbers to view the category ...*",
        "**1. Bodyguards**",
        "**2. Boosters**",
        "**3. Other**"
      ],
      // Categories
      ["Rookie", "Gold", "Deluxe", "Chad"],
      [
        "Economy Boosters",
        "**1. x1.5**",
        "**2. x2**",
        "**3. x2.5**",
        "x1.5",
        "x2",
        "x2.5"
      ],
      ["Change Nickname"]
    ];

    makeShopListener(toEdit, embedDescs);
  }
}

function makeShopListener(message: Message, descriptions: string[][]) {
  console.log("method was run");
  const embed = message.embeds[0];

  const filter = (m: Message) =>
    m.author.id === message.author.id && m.channel.id === message.channel.id;

  message.channel
    .awaitMessages(filter, { max: 1, time: 60000, errors: ["time"] })
    .then(collected => {
      const reply = collected.array()[0];
      console.log("content was registered");

      if (reply.content === "cancel") return message.edit("Closed store.");
      if (
        reply.embeds[0].description!.includes("Type any") &&
        reply.content === "back"
      ) {
        makeShopListener(message, descriptions);
        return message.channel
          .send("You cant go any further back - do `cancel` to close the shop!")
          .then(msg => msg.delete({ timeout: 3000 }));
      }

      // Default embed
      if (embed.description?.includes("Type any")) {
        if (!reply.content.match(/^[1-3]$/m)) {
          makeShopListener(message, descriptions);
          return message.channel.send("Please pick a valid number");
        }
      }

      if (embed.title === "Bodyguards" && !reply.content.match(/^[1-4]$/m)) {
        makeShopListener(message, descriptions);
        return message.channel.send("Please pick a valid number");
      }

      if (embed.title === "Bodyguards" && !reply.content.match(/^[1-4]$/m)) {
        makeShopListener(message, descriptions);
        return message.channel.send("Please pick a valid number");
      }

      message.edit(embed.setTitle("Shop").setDescription(descriptions[0]));
    })
    .catch(_ => message.channel.send("You took too long."));
}
