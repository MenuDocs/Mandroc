import { Color, command, MandrocCommand, Resource, search } from "@lib";
import { Message, MessageEmbed } from "discord.js";

@command("mdn", {
  aliases: [ "js", "mdn" ],
  description: {
    content: "Allows members to search the MDN web documentation.\nMake sure to be specific or the requested document wont be found.",
    examples: (prefix: string) => [
      `${prefix}js String.prototype.split()`,
      `${prefix}mdn Array.isArray()`
    ],
    usage: "<query>"
  },
  args: [
    {
      id: "resource",
      prompt: {
        start: "Please give me a query for searching MDN",
        retry: "Please try again."
      },
      match: "rest",
      type: (_, p) => search(p)
    }
  ]
})
export default class MDNCommand extends MandrocCommand {
  public async exec(message: Message, { resource }: args) {
    if (!this.client.canMDN) {
      const embed = new MessageEmbed()
        .setColor(Color.Danger)
        .setDescription("Sorry, I can't search the MDN docs. Please contact an administrator.");

      return message.util?.send(embed);
    }

    resource.summary = resource.summary
      .replace(/<code><strong>(.+)<\/strong><\/code>/g, "<strong><code>$1</code></strong>");

    const embed = new MessageEmbed()
      .setColor(Color.Primary)
      .setTitle(resource.title)
      .setURL(`https://developer.mozilla.org${resource.url}`)
      .setDescription(this.client.turndown.turndown(resource.summary));

    if (resource.tags) {
      embed.setFooter(resource.tags.join(", "));
    }

    return message.util?.send(embed);
  }
}

type args = {
  resource: Resource;
}