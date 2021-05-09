// import ms from "ms";
// import { Module } from "../Module";
// import { Embed } from "../../../util";
//
// import type { GuildMember, Message } from "discord.js";
// import type { AutoMod } from "../AutoMod";
//
// class AntiRaid extends Module {
//   readonly priority = 1;
//
//   public static onGoingRaid = false;
//   public static recentJoins = new Array<GuildMember>();
//   public static lastJoin?: Date = undefined;
//
//   constructor(automod: AutoMod) {
//     super(automod);
//
//     setInterval(() => {
//       AntiRaid.recentJoins = [];
//     }, ms("15m"));
//
//     setInterval(async () => {
//       if (AntiRaid.onGoingRaid) {
//         const lastJoin = AntiRaid.lastJoin
//         if (lastJoin && new Date().getMinutes() - lastJoin.getMinutes() < 5) {
//           AntiRaid.onGoingRaid = false;
//           return
//         }
//
//         if (AntiRaid.recentJoins.length) {
//           await AntiRaid.raidKick(AntiRaid.recentJoins);
//         }
//       }
//     }, ms("5m"));
//   }
//
//   async run(message: Message): Promise<boolean> {
//     if (AntiRaid.onGoingRaid) {
//       for await (const [ , channel ] of message.guild?.channels.cache.filter(
//         chan =>
//           chan.type === "text" &&
//           [
//             "762898487201234999", // general
//             "762898487372677138", // discord bot support
//             "762898487527473154", // development support
//           ].includes(chan.parentID!)
//       )!) {
//         await channel.fetch(true);
//
//         await channel.overwritePermissions(
//           [
//             {
//               id: "762898486571827232",
//               deny: "SEND_MESSAGES"
//             }
//           ],
//           "AutoMod - OnGoingRaid"
//         );
//       }
//     }
//
//     return false;
//   }
//
//   static async raidKick(members: GuildMember[]) {
//     for await (const member of members) {
//       setTimeout(async () => {
//         await member.send(
//           Embed.Warning(
//             [
//               "Due to an ongoing raid, this server is in lockdown mode.",
//               "If you're not a raider, fear not. You've just been kicked from the server.",
//               "Please rejoin later! Keep in mind this was done in order to prevent further raiding."
//             ].join("\n")
//           )
//         );
//         await member.kick("AutoMod - On Going Raid");
//       }, ms("1s"));
//     }
//   }
// }
