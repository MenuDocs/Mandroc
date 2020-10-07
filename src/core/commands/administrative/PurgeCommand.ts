import { adminCommand, MandrocCommand } from "@lib";

@adminCommand("purge", {
  aliases: ["purge"]
})
export default class PurgeCommand extends MandrocCommand {

}