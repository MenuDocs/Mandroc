/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { adminCommand, Color, MandrocCommand, PermissionLevel } from "@lib";

import type { Message, User } from "discord.js";
import { MessageEmbed } from "discord.js";

@adminCommand("notes", {
  aliases: ["notes"],
  editable: false,
  permissionLevel: PermissionLevel.TRIAL_MOD,
  args: [
    {
      id: "action",
      match: "phrase",
      prompt: {
        start: "Please provide a valid action... `add|remove|list`",
        retry: "I need a valid action!"
      }
    },
    {
      id: "user",
      type: "member",
    },
    {
      id: "note",
      match: "rest",
    },
  ],
})
export default class NotesCommand extends MandrocCommand {
   async exec(message: Message, { action, user, note }: args) {
     const embed = new MessageEmbed()
       .setColor(Color.PRIMARY);

     const key = "config.member-notes:all";
     const operation = () => {
       return user ? this.client.redis.client.hmget(key, user.id) : this.client.redis.client.hvals(key)
     }

     console.log("act: "+action);
     console.log("usr: "+user);
     console.log("note: "+note);
     console.log("---------------");

     const list = await operation().then(res => {
       return res.length ? res.map(x => JSON.parse(x!)) as Array<Note> : [];
     });

     if (!list.length || list[0] === null && action === "list") {
       embed
         .setDescription(`This ${user === null ? 'user' : 'guild'} holds no watched users.`);

       return message.util?.send(embed);
     }

     if (action === "list") {
       embed
         .setDescription(list.map(({ issuer, message }, index) => {
           const resUser = (uId: string) => this.client.users.cache.get(uId);

           return `\`${index}.\` *${message}* **~${resUser(issuer)?.tag}**\n`;
         }));

       return message.util?.send(embed);
   }

    if (!user) {
      embed
        .setDescription("Usage: !notes <action> [user] [note]");

      return message.util?.send(embed);
    }

    if (action === "add") {
      const obj: Note = { issuer: message.author.id, target: user?.id!, message: note!, date: Date.now() }

      await this.client.redis.client.hset(key, obj.target, JSON.stringify(obj));

      embed
        .setDescription("Successfully added note to " + user);

      message.util?.send(embed);
    } else {
      // implement numerated way to remove notes - possibly using array index
    }
  }
}

type args = {
  action?: "add" | "remove" | "list";
  user?: User;
  note?: string;
};

interface Note {
  message: string;
  issuer: string;
  target: string;
  date: number;
}