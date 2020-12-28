/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import {
  command,
  Embed,
  MandrocCommand,
  PermissionLevel,
} from "@lib";

import type { Message } from "discord.js";

@command("timeleft", {
  aliases: ["timeleft"],
  description: {
    content: "Returns the time left on an infraction.",
    examples: (prefix: string) => [
      `${prefix}timeleft`,
      `${prefix}timeleft @T3NED#0001`,
    ],
    usage: "[punishedId]",
  },
})
export default class TimeLeftCommand extends MandrocCommand {
  public async exec(message: Message, { punishedId }: args) {
    const embed = Embed;
    if (message.member?.permissionLevel! < PermissionLevel.MOD) {
      const [key] = await this.client.redis.scan(
          `tasks:*.${message.member?.id}`
        ),
        data = await this.client.redis.client.hgetall(key);

      if (!data) {
        embed.Primary("You do not have any currently on-going infractions.");

        return message.util?.send(embed);
      }
      embed.Primary(`You have ${+data.runAt} remaining`);

      return message.util?.send(embed);
    }

    const [key] = await this.client.redis.scan(
      `tasks:*.${punishedId}`
      ),
      data = await this.client.redis.client.hgetall(key);

    if (!data) {
      embed.Warning("User does not have any on-going infractions.");

      return message.util?.send(embed)
    }

    embed.Primary(`They have ${+data.runAt} remaining`);

    return message.util?.send(embed);
  }
}

type args = {
  punishedId: string;
};
