import { command, MandrocCommand } from "@lib";
import { Flag } from "discord-akairo";

@command("rep", { aliases: ["rep", "reputation"] })
export default class RepCommand extends MandrocCommand {
  public *args() {
    const method = yield {
      default: "rep-view",
      type: [
        ["rep-add", "add", "+"],
        ["rep-remove", "remove", "-"],
        ["rep-view", "view", "v"]
      ]
    };

    return Flag.continue(method);
  }
}
