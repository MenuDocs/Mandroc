import { Listener } from "discord-akairo";
import { listener } from "@lib";
import type { Message } from "discord.js";

@listener("message", { event: "message", emitter: "client" })
export default class ReadyListener extends Listener {
  //private messageCache = new MessageSenderCache();

  public exec(message: Message) {
    console.log(message.content);
    const mutedRole = message.guild?.roles.cache.find(
      (role) => role.name.toLocaleLowerCase() === "muted"
    );

    const maxAge = 6e3;
    const messages = message.channel.messages.cache.filter(
      (msg) =>
        msg.author.id === message.author.id &&
        Date.now() - message.createdTimestamp < maxAge
    );

    if (messages.size >= 6) {
      if (messages.size === 6) {
        message.channel.send(`${message.author}, stop spammming.`);
      } else if (messages.size === 8) {
        message.channel.send(
          `${message.author}, stop spamming! **Final warning!**`
        );
      } else if (messages.size > 10) {
        if (mutedRole) {
          if (!message.member?.roles.cache.has(mutedRole.id))
            message.member?.roles.add(mutedRole);
        }
      }
    }
  }
}
