import { adminCommand, Color, Database, MandrocCommand, PermissionLevel } from "@lib";
import { Message, MessageEmbed, User } from "discord.js";

@adminCommand("eco", {
  permissionLevel: PermissionLevel.Management,
  aliases: [ "eco" ],
  description: {
    content: "Adjust a user's economy.",
    examples: (prefix: string) => [
      `${prefix}eco @R1zeN add 60`,
      `${prefix}eco @duncte123#1245 remove 80`,
      `${prefix}eco T3NED#0001 set 2`
    ],
    usage: "<package>"
  },
  args: [
    {
      id: "receiver",
      type: "user",
      prompt: {
        start: "Please give me a user to transfer to.",
        retry:
          "Please provide a user ... Example: `!eco @R1zeN#0001 set pocket 50`"
      }
    },
    {
      id: "action",
      type: "string",
      prompt: {
        start: "Please provide an action!",
        retry: "Please try again ... Example: ``!eco @R1zeN#0001 remove bank 50"
      }
    },
    {
      id: "account",
      type: "string",
      prompt: {
        start: "Please provide an account to affect!",
        retry: "Please try again ... Example: ``!eco @R1zeN#0001 add pocket 50"
      }
    },
    {
      id: "amount",
      type: "number",
      match: "rest",
      prompt: {
        start: "Please provide an amount to transfer to that user!",
        retry: "Please try again ... Example: ``!eco @R1zeN#0001 remove bank 50"
      }
    }
  ]
})
export default class EcoCommand extends MandrocCommand {
  public async exec(
    message: Message,
    {
      receiver,
      action,
      account,
      amount
    }: args
  ) {
    const actionRegex = /(set|remove|add)/gm,
      accountRegex = /(pocket|bank)/gm;

    const receiverProfile = await Database.PRISMA.profile.upsert({
      where: { id: receiver.id },
      create: { id: receiver.id },
      update: {},
      select: {
        pocket: true,
        bank: true
      }
    });

    const embed = new MessageEmbed();
    if (!actionRegex.exec(action)) {
      embed
        .setColor(Color.Warning)
        .setDescription("Your action must match `set|remove|add`");

      return message.util?.send(embed);
    }

    if (!accountRegex.exec(account)) {
      embed
        .setColor(Color.Warning)
        .setDescription("Your account must match `pocket|bank`");

      return message.util?.send(embed);
    }

    action = action.toLocaleLowerCase();
    if (action === "set") {
      if (account === "pocket") {
        receiverProfile!.pocket = amount;
      } else {
        receiverProfile!.bank = amount;
      }
    }

    if (action === "add") {
      if (account === "pocket") {
        receiverProfile!.pocket += amount;
      } else {
        receiverProfile!.bank += amount;
      }
    }

    if (action === "remove") {
      if (account === "pocket") {
        receiverProfile!.pocket -= amount;
      } else {
        receiverProfile!.bank -= amount;
      }
    }

    await Database.PRISMA.profile.update({
      where: { id: receiver.id },
      data: receiverProfile
    });

    embed
      .setColor(Color.Success)
      .setDescription(`Successfully ran \`${action}\` affecting ${receiver}'s \`${account}\``);

    message.util?.send(embed);
  }
}

type args = {
  receiver: User;
  action: string;
  account: string;
  amount: number;
};
