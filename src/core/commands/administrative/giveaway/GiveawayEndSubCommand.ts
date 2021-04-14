import { adminCommand, Embed, Giveaway, MandrocCommand } from "@lib";
import type { Message } from "discord.js";

@adminCommand("giveaway-end", {
  args: [
    {
      id: "id",
      prompt: {
        start: "Provide the ID of the giveaway to end.",
        retry: "Provide a valid giveaway id"
      }
    }
  ]
})
export class GiveawayEndSubCommand extends MandrocCommand {
  async exec(message: Message, { id }: args) {
    if (!(await Giveaway.exists(id))) {
      const embed = Embed.Primary("No giveaway found with this ID.");
      return message.util?.send(embed);
    }

    await Giveaway.end(id);
  }
}

type args = {
  id: string;
};
