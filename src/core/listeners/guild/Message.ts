import { listener, Profile } from "@lib";
import { Listener } from "discord-akairo";
import type { Message } from "discord.js";

@listener("message", { event: "message", emitter: "client"})
export default class MessageListener extends Listener {
  async exec(message: Message): Promise<Profile> {
    const profile = await Profile.findOne({ _id: message.author.id }) ??
      await Profile.create({ _id: message.author.id });

    profile.pocket += 2;
    return profile.save();
  }
}
