import { adminCommand, Giveaway, MandrocCommand } from "@lib";
import type { Message } from "discord.js";

@adminCommand("giveaway-create", {
  description: {
    content: "starts a new giveaway.",
    usage: "<duration> <prize> [amount of winners]"
  },
  args: [
    {
      id: "duration",
      type: "duration",
      prompt: {
        start: "Provide the duration of this giveaway.",
        retry: "Provide a valid duration."
      }
    },
    {
      id: "prize",
      prompt: {
        start: "Provide a prize lol."
      }
    },
    {
      id: "winners",
      type: "number",
      default: 1
    }
  ]
})
export class GiveawayStartSubCommand extends MandrocCommand {
  async exec(message: Message, { duration, winners, prize }: args) {
    await Giveaway.create(message, duration, prize, winners);
  }
}

type args = {
  duration: number;
  winners: number;
  prize: string;
};
