import {
  censorToken,
  code as cb,
  Color,
  command,
  isPromise,
  MandrocCommand,
} from "@lib";
import { Message, MessageEmbed } from "discord.js";
import { inspect } from "util";

@command("eval", {
  aliases: ["eval"],
  ownerOnly: true,
  args: [
    {
      id: "code",
      match: "rest",
      prompt: {
        start: "I need code to evaluate...",
        retry: "Bruh... just give me some code... smh...",
      },
    },
    {
      id: "silent",
      match: "flag",
      flag: ["-s", "--silent"],
    },
    {
      id: "depth",
      type: "number",
      match: "option",
      flag: ["-d", "--depth"],
      default: 0,
    },
    {
      id: "async",
      match: "flag",
      flag: ["-a", "--async"],
    },
  ],
})
export default class EvalCommand extends MandrocCommand {
  public async exec(message: Message, args: args) {
    let code = args.code;
    if (args.async || code.includes("await")) {
      code = `(async () => {${code}})()`;
    }

    let res;
    try {
      res = eval(code);
      if (isPromise(res)) res = await res;
    } catch (e) {
      const embed = new MessageEmbed()
        .setColor(Color.Danger)
        .setDescription([
          "Ran into an error while evaluating...",
          cb("js")`${e}`,
        ]);

      return message.util?.send(embed);
    }

    if (!args.silent) {
      if (typeof res !== "string") {
        res = inspect(res, {
          depth: args.depth,
          getters: true,
        });
      }

      if (res.length >= 2048) {
        res = res.slice(0, 2000);
        res += "\n...";
      }

      res = res
        .replace(/[\w\d]{24}\.[\w\d]{6}\.[\w\d-_]{27}/g, (t: string) =>
          censorToken(t)
        )
        .replace(/`/g, `\`${String.fromCharCode(8203)}`)
        .replace(/@/g, `@${String.fromCharCode(8203)}`);

      const embed = new MessageEmbed()
        .setColor(Color.Primary)
        .setDescription(cb("js")`${res}`);

      return message.util?.send(embed);
    }

    return message.react("✅");
  }
}

type args = {
  code: string;
  silent: boolean;
  depth: number;
  async: boolean;
};
