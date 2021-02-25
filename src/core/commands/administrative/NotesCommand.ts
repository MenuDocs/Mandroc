/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { adminCommand, Color, MandrocCommand, PermissionLevel } from "@lib";

import type { Message, User } from "discord.js";
import { MessageEmbed } from "discord.js";

@adminCommand("notes", {
  editable: false,
  permissionLevel: PermissionLevel.TRIAL_MOD,
  args: [
    {
      id: "action",
      match: "phrase",
      prompt: {
        start: "Please provide a valid action... `add|remove|list`",
        retry: "I need a valid action!",
      },
    },
    {
      id: "user",
      type: "member",
    },
    {
      id: "id",
      type: "number",
      unordered: true,
    },
    {
      id: "note",
      match: "rest",
      unordered: true,
    },
  ],
})
export default class NotesCommand extends MandrocCommand {
  async exec(message: Message, { action, user, note, id }: args) {
    const resUser = (uId: string) => this.client.users.cache.get(uId);
    const embed = new MessageEmbed().setColor(Color.PRIMARY);

    const notesKey = "config.member-notes:all";
    const countKey = "config.member-notes:count";
    const operation = (scoped: boolean) => {
      return scoped
        ? this.client.redis.client.hmget(notesKey, user!.id)
        : this.client.redis.client.hgetall(countKey);
    };

    console.log("act: " + action);
    console.log("usr: " + user);
    console.log("note: " + note);
    console.log("id: " + id);
    console.log("---------------");

    const list = await operation(!!user).then((res: any) => {
      if (user === null) {
        if (res) {
          const [keys, values] = [Object.keys(res), Object.values(res)];
          return keys.map((key, i) => {
            return {
              target: key,
              count: values[i],
            };
          }) as Array<NoteCount>;
        } else return [];
      } else {
        return res.length && res[0] !== null
          ? (JSON.parse(res[0]) as Array<Note>)
          : [];
      }
    });

    if (list.length < 1 && action === "list") {
      embed.setDescription(
        `This ${user === null ? "guild" : "user"} has no notes.`
      );

      return message.util?.send(embed);
    }

    if (action === "list") {
      embed.setTitle(
        `${user ? resUser(user?.id)?.tag : message.guild}'s Notes`
      );
      embed.setDescription(
        list.map((data: Note | NoteCount, index: number) => {
          if (user === null) {
            const note = <NoteCount>data;
            return `\`${index}.\` *${resUser(note.target)?.tag}* (**${
              note.count
            }**)\n`;
          } else {
            const { issuer, message } = <Note>data;
            return `\`${index}.\` *${message}* **~${resUser(issuer)?.tag}**\n`;
          }
        })
      );

      return message.util?.send(embed);
    }

    if ((!user || note === null) && ["add", "remove"].includes(action!)) {
      embed.setDescription("Usage: !notes <action> [user] [note]");

      return message.util?.send(embed);
    }

    if (action === "add") {
      const obj = <Array<Note>>[
        ...list,
        {
          issuer: message.author.id,
          target: user?.id!,
          message: note!,
          date: Date.now(),
        },
      ];

      await this.client.redis.client.hset(
        notesKey,
        obj[0].target,
        JSON.stringify(obj)
      );
      await this.client.redis.client.hincrby(countKey, obj[0].target, 1);

      embed.setDescription("Successfully added note to " + user);

      message.util?.send(embed);
    } else {
      if (id === null) {
        embed.setDescription("A valid note ID was not provided!");

        return message.util?.send(embed);
      }

      if (!list[id!]) {
        embed.setDescription(
          `The provided ID \`${id!}\` is not in range for **${resUser(
            user!.id
          )}** (Length: \`${list.length}\`).`
        );

        return message.util?.send(embed);
      }

      const noteToDelete = (<Array<Note>>list)[id!];
      const newResults = (<Array<Note>>list).filter(
        (note: Note) => note !== noteToDelete
      );

      await this.client.redis.client.hset(
        notesKey,
        noteToDelete.target,
        JSON.stringify(newResults)
      );
      const amount = await this.client.redis.client.hincrby(
        countKey,
        noteToDelete.target,
        -1
      );
      if (amount === 0) {
        await Promise.all([
          this.client.redis.client.hdel(notesKey, noteToDelete.target),
          this.client.redis.client.hdel(countKey, noteToDelete.target),
        ]);
      }

      embed.setDescription(
        `Successfully removed note \`${id!}\` from **${
          resUser(noteToDelete.target)?.tag
        }**.`
      );

      return message.util?.send(embed);
    }
  }
}

type args = {
  action?: "add" | "remove" | "list";
  user?: User;
  id?: number;
  note?: string;
};

interface Note {
  message: string;
  issuer: string;
  target: string;
  date: number;
}

interface NoteCount {
  target: string;
  count: number;
}
