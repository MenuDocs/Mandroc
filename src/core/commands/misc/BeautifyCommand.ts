/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import { command, MandrocCommand } from "@lib";
import beautify from "js-beautify";

import type { Message } from "discord.js";

@command("beautify", {
  aliases: ["beautify"],
  args: [
    {
      id: "code",
      match: "rest",
      prompt: {
        start:
          "I need some code to make **beautiful**, kinda embarrassing that you're using this command in the first place.",
        retry:
          "Bro, just get it over with. You're embarrassing yourself by trying to make your horrible looking code beautiful... with the help of a discord bot.",
      },
    },
  ],
})
export default class BeautifyCommand extends MandrocCommand {
  public async exec(message: Message, { code }: args) {
    const beautified = beautify(code, {
      end_with_newline: true,
      indent_size: 2,
    });

    return message.util?.send(beautified);
  }
}

type args = {
  code: string;
};
