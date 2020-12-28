import { listener } from "@lib";
import { Listener } from "discord-akairo";

@listener("guild-ban-remove", { event: "guildBanRemove", emitter: "client" })
export class GuildBanRemove extends Listener {
  exec() {}
}
