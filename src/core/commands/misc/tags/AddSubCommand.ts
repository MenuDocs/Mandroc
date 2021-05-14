import { command, Database, Embed, MandrocCommand, PermissionLevel } from "@lib";
import type { Message } from "discord.js";

@command("tag-add", {
  channel: "guild",
  args: [
    {
      id: "name",
      prompt: {
        start: "Please give me the name of the tag."
      }
    },
    {
      id: "contents",
      match: "rest",
      prompt: {
        start: "I need some content so the tag can even show up. smh noob"
      }
    },
    {
      id: "type",
      type: [ "embedded", "regular" ],
      match: "option",
      flag: [ "-t", "--type" ],
      default: "regular"
    },
    {
      id: "category",
      flag: [ "-c", "--category", "--cat" ],
      match: "option",
      default: "general"
    },
    {
      id: "staffOnly",
      match: "flag",
      flag: [ "--staffOnly" ]
    },
    {
      id: "roles",
      flag: [ "-r", "--roles" ],
      match: "option"
    },
    {
      id: "supportOnly",
      match: "flag",
      flag: [ "--supportOnly" ]
    }
  ],
  permissionLevel: PermissionLevel.Helper
})
export default class AddSubCommand extends MandrocCommand {
  public async exec(
    message: Message,
    {
      name,
      contents,
      type,
      category,
      roles,
      staffOnly,
      supportOnly
    }: args
  ) {
    if (this.handler.findCommand(name)) {
      return message.util?.send(
        Embed.primary(
          `A command with the name or alias, **${name}**, already exists.`
        )
      );
    }

    const exists = await Database.PRISMA.tag.count({ where: { name } }) > 0;
    if (exists) {
      return message.util?.send(Embed.primary(`The tag, **${name}**, already exists.`));
    }

    console.log(roles);

    await Database.PRISMA.tag.create({
      data: {
        name: name,
        contents: contents,
        authorId: message.author.id,
        embedded: type === "embedded",
        category: category,
        staffOnly: staffOnly ?? false,
        supportOnly: supportOnly ?? true,
        allowedRoles: roles?.split(/[\s,]+/g) || []
      }
    });

    const embed = Embed.primary(`I created the tag \`${name}\`${category === "general" ? "" : ` and added it to the **${category.capitalize()}** category`}.`);
    return message.util?.send(embed);
  }
}

type args = {
  type: "embedded" | "regular";
  contents: string;
  name: string;
  category: string;
  supportOnly: boolean;
  staffOnly: boolean;
  roles?: string;
};
