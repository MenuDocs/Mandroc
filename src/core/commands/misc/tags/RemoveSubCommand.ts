import { command, Embed, MandrocCommand, PermissionLevel, Tag } from "@lib";
import type { Message } from "discord.js";

@command("tag-remove", {
  args: [
    {
      id: "tag",
      type: "tag",
      prompt: {
        start: "I need a tag to delete.",
      },
    },
  ],
  permissionLevel: PermissionLevel.HELPER,
})
export default class RemoveSubCommand extends MandrocCommand {
  public async exec(message: Message, { tag }: args) {
    await tag.remove();
    return message.util?.send(
      Embed.Primary(`Deleted the tag **${tag.name}** successfully.`)
    );
  }
}

type args = {
  tag: Tag;
};
