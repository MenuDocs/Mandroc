/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { Module } from "../Module";

import type { Message } from "discord.js";
import { Collection, MessageEmbed } from "discord.js";
import type { AutoMod } from "../AutoMod";
import { Color } from "@lib";

export class AntiMassModeration extends Module {
    readonly priority = 2;
    static bucket = new Collection<string, number>();

    constructor(automod: AutoMod) {
        super(automod);
        setInterval(() => AntiMassModeration.bucket.clear(), 30000)
    }

    async run(message: Message): Promise<boolean> {
        const bUser = AntiMassModeration.bucket.get(message.author.id);

        if (!bUser) return false;
        if (bUser >= 5) {
            const embed = new MessageEmbed()
              .setColor(Color.WARNING)
              .setDescription("You've temporarily been denied from using staff commands, due to a recent over-use.");

            message.util?.send(embed);
            return true;
        }

        return false
    }

    static incrememtCommandUsage(message: Message) {
        AntiMassModeration.bucket.set(
          message.author.id,
          AntiMassModeration.bucket.get(message.author.id) ?? 0
          )
    }
}
