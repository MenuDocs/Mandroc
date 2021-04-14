import {
  command,
  DEFAULT_TAG_PERMISSIONS,
  Embed,
  MandrocCommand,
  PermissionLevel,
  Tag
} from "@lib";
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
      type: ["embedded", "regular"],
      match: "option",
      flag: ["-t", "--type"],
      default: "embedded"
    },
    {
      id: "category",
      flag: ["-c", "--category", "--cat"],
      match: "option",
      default: "general"
    },
    {
      id: "staffOnly",
      flag: ["--staffOnly"]
    },
    {
      id: "roles",
      flag: ["-r", "--roles"],
      match: "option"
    },
    {
      id: "supportOnly",
      flag: ["--supportOnly"]
    }
  ],
  permissionLevel: PermissionLevel.Helper
})
export default class AddSubCommand extends MandrocCommand {
  public async exec(
    message: Message,
    { name, contents, type, category, roles, staffOnly, supportOnly }: args
  ) {
    if (this.handler.findCommand(name)) {
      return message.util?.send(
        Embed.Primary(
          `A command with the name or alias, **${name}**, already exists.`
        )
      );
    }

    const existing = await Tag.findOne({ where: { name } });
    if (existing) {
      return message.util?.send(
        Embed.Primary(`The tag, **${name}**, already exists.`)
      );
    }

    const perms = DEFAULT_TAG_PERMISSIONS;
    if (
      message.member!.permissionLevel &&
      message.member!.permissionLevel >= PermissionLevel.Mod
    ) {
      if (roles) {
        perms.roles = roles.split(/[ ,]+/g);
      } else {
        perms.supportOnly = supportOnly ?? true;
        perms.staffOnly = staffOnly ?? false;
      }
    }

    await Tag.create({
      name,
      authorId: message.author.id,
      contents,
      embedded: type === "embedded",
      category,
      perms
    }).save();

    return message.util?.send(Embed.Primary(`I created the tag **${name}**`));
  }
}

type args = {
  type: "embedded" | "regular";
  contents: string;
  name: string;
  category: string;
  supportOnly: boolean;
  staffOnly: boolean;
  roles: string;
};
