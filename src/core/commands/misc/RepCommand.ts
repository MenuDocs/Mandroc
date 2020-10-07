import { command, MandrocCommand } from "@lib";

@command("rep", {
  aliases: ["rep", "reputation"],
  args: [{}],
})
export default class RepCommand extends MandrocCommand {}
