import { Color, command, MandrocCommand } from "@lib";
import { URLSearchParams } from "url";
import fetch from "node-fetch";
import { Message, MessageEmbed } from "discord.js";

const API_URL = "https://djsdocs.sorta.moe/v2/embed";

@command("djs", {
  aliases: ["djs", "discord.js", "discord-js"],
  description: {
    content: "Allows members to search the discord.js documentation.",
    examples: (prefix: string) => [
      `${prefix}djs Client`,
      `${prefix}djs Message#reply`,
      `${prefix}djs CommandUtil#sendNew --type akairo-master`,
    ],
    usage: "<query> [--type stable|master|rpc|commando]",
  },
  args: [
    {
      id: "query",
      match: "rest",
      prompt: {
        start:
          "Please give me query for searching the discord.js, command, and akairo documentation.",
        retry: "Please try again... Example: `Client#login`",
      },
    },
    {
      id: "type",
      type: ["stable", "master", "rpc", "commando", "akairo-master"],
      match: "option",
      flag: ["-t", "--type"],
      default: "stable",
    },
  ],
})
export default class DJSCommand extends MandrocCommand {
  public async exec(message: Message, { query, type }: args) {
    if (query === "djs") {
      return message.util?.send(
        new MessageEmbed()
          .setColor(Color.PRIMARY)
          .setImage("https://i.redd.it/1gxyc19z70s51.jpg")
      );
    }

    const qs = new URLSearchParams({
      src: type.toLowerCase(),
      q: query.replace(/#/g, "."),
      force: "false",
    });

    const res = await fetch(`${API_URL}?${qs}`).then((r) => r.json());
    if (!res) {
      const embed = new MessageEmbed()
        .setDescription(`Sorry, I couldn't find anything for \`${query}\``)
        .setColor(Color.WARNING);

      return message.util?.send(embed);
    }

    const embed = new MessageEmbed(res).setColor(Color.PRIMARY);

    return message.util?.send(embed);
  }
}

type args = {
  query: string;
  type: "stable" | "master" | "rpc" | "commando" | "akairo-master";
};
