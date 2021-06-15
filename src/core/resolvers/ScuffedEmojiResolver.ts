import { Resolver } from "@lib";
import { Emoji, Message } from "discord.js";
import { test } from "twemoji";

export class ScuffedEmojiResolver extends Resolver<Emoji> {
  static REGEX = /^<a?:[a-zA-Z0-9_]+:(\d{17,19})>$/;

  constructor() {
    super("scuffed-emoji", {
      name: "scuffedEmoji"
    });
  }


  exec(message: Message, phrase: string | null): Emoji | null {
    if (!phrase) {
      return null;
    }

    /* check for unicode emojis. */
    if (test(phrase)) {
      return new Emoji(this.client, { name: phrase, animated: false })
    }

    /* try finding a guild emoji. */
    const snowflake = ScuffedEmojiResolver.REGEX.exec(phrase)?.[1] ?? /^\d{17,19}$/.exec(phrase)?.[0];
    if (!snowflake) {
      return null;
    }

    return message.guild?.emojis?.cache?.get(snowflake) ?? null;
  }

}
